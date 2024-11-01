# Copyright 2024 The Wazo Authors  (see the AUTHORS file)
# SPDX-License-Identifier: GPL-3.0-or-later

from __future__ import annotations

import itertools
import logging
import time
import uuid

from requests import RequestException
from wazo_auth_client.client import AuthClient
from wazo_calld.plugin_helpers.exceptions import WazoAmidError
from wazo_chatd_client.client import ChatdClient
from wazo_confd_client.client import ConfdClient

from .notifier import EmergencyCheckNotifier
from .utils import EmergencyCheckState, EmergencyType, UserState

logger = logging.getLogger(__name__)

EMERGENCY_MESSAGE_TEMPLATES = {
    "fire": """
    FIRE! FIRE! FIRE!
    Please respond "safe" if you are away from danger.
    Respond "unsafe" if you are still in danger.
    """
}


def originate(amid, endpoint):
    try:
        amid.action(
            "Originate", {"Channel": endpoint, "Exten": "s", "Context": "xivo-ivr-1"}
        )
    except RequestException as e:
        raise WazoAmidError(amid, e)


def batched(it, batch_size):
    for i in range(0, len(it), batch_size):
        yield list(itertools.islice(it, i, i + batch_size))


def _future_handler(future):
    try:
        future.result()
    except Exception as e:
        logger.exception(e)


class EmergencyCheckService:
    def __init__(
        self,
        threadpool,
        emergencies: dict[str, EmergencyCheckState],
        ari,
        notifier: EmergencyCheckNotifier,
        amid_client,
        auth_client: AuthClient,
        confd_client: ConfdClient,
        chatd_client: ChatdClient,
        system_users: dict[str, dict],
    ):
        self._ari = ari.client
        self._auth_client = auth_client
        self._amid_client = amid_client
        self._confd_client = confd_client
        self._chatd_client = chatd_client
        self._notifier = notifier
        self._emergencies = emergencies
        self._threadpool = threadpool
        self._system_users = system_users

        logger.debug(
            "Initiated EmergencyCheckService with system users %s", system_users
        )

    def create_emergency_check(
        self,
        emergency_type: EmergencyType,
        user_uuid: str,
        tenant_uuid: str,
        targeted_users: list[str] | None = None,
    ) -> str:
        emergency_id = str(uuid.uuid4())

        if not targeted_users:
            targeted_users = self._get_tenant_users(tenant_uuid)

        self._emergencies[emergency_id] = emergency_state = EmergencyCheckState(
            status="started",
            timestamp=time.time(),
            originator=user_uuid,
            targeted_users={user_uuid: "pending" for user_uuid in targeted_users},
            emergency_type=emergency_type,
            uuid=emergency_id,
            tenant_uuid=tenant_uuid,
        )
        _future = self._threadpool.submit(
            self._trigger_emergency_check, emergency_state
        )
        _future.add_done_callback(_future_handler)
        self._emergencies[emergency_id]._futures.append(_future)
        return emergency_id

    def _get_tenant_users(self, tenant_uuid) -> list[str]:
        users = self._confd_client.users.list(tenant_uuid=tenant_uuid)["items"]
        logger.debug("%d users in tenant %s", len(users), tenant_uuid)
        return [
            user["uuid"]
            for user in users
            if not user["firstname"].startswith("emergency-check")
        ]

    def get_emergency_check_state(self, emergency_id, tenant_uuid):
        emergency = self._emergencies[emergency_id]
        if emergency.tenant_uuid != tenant_uuid:
            raise PermissionError()
        return emergency

    def _trigger_emergency_check(self, emergency_check: EmergencyCheckState):
        logger.info(
            "Triggering emergency check for %d users",
            len(emergency_check.targeted_users),
        )
        self._notifier.notify_emergency_check(emergency_check)
        for user_uuid in emergency_check.targeted_users:
            logger.info("Triggering emergency check for user %s", user_uuid)
            self._send_chatd_message(user_uuid, emergency_check)
        # generate originates in batches of 20,
        # with 1 second pause between batches to avoid overloading asterisk
        # pending_users = [
        #     user_uuid for user_uuid, user_state in emergency_check.targeted_users.items()
        #     if user_state == 'pending'
        # ]
        # while len(pending_users) > 0:
        #     for batch in batched(pending_users, 20):
        #         for user_uuid in batch:
        #             if emergency_check.targeted_users[user_uuid] == 'pending':
        #                 logger.debug('Calling user %s', user_uuid)
        #                 self._call_user_lines(user_uuid, emergency_check)
        #         time.sleep(1)
        # logger.info('Emergency check concluded for %d users', len(emergency_check.targeted_users))
        # emergency_check.status = 'concluded'

    def _call_user_lines(self, user_uuid: str, emergency_check: EmergencyCheckState):
        try:
            originate(self._amid_client, f"Local/{user_uuid}@usersharedlines")
        except WazoAmidError:
            logger.exception("Failed to originate user %s", user_uuid)
            return False
        else:
            return True

    def _get_system_user_token(self, tenant_uuid: str):
        logger.debug("auth_client token: %s", self._auth_client._token_id)
        tenant = self._auth_client.tenants.get(tenant_uuid)
        username = f'emergency-check+{tenant["slug"]}@wazo.io'
        token = self._auth_client.token.new(
            username=username,
            password="superpass",
        )
        return token

    def _send_chatd_message(self, user_uuid: str, emergency_check: EmergencyCheckState):
        token = self._get_system_user_token(emergency_check.tenant_uuid)

        self._chatd_client.set_token(token["token"])

        room = self._chatd_client.rooms.create_from_user(
            {
                "name": f"EMERGENCY CHECK - {emergency_check.emergency_type}",
                "users": [{"uuid": user_uuid}],
            }
        )
        emergency_check.chat_room = room["uuid"]
        self._chatd_client.rooms.create_message_from_user(
            room["uuid"],
            {
                "content": EMERGENCY_MESSAGE_TEMPLATES[
                    emergency_check.emergency_type
                ].format(),
                "alias": "emergency check service",
            },
        )

    def conclude_emergency_check(self, emergency_id: str):
        logger.info("emergency check concluded")
        emergency_check = self._emergencies[emergency_id]
        emergency_check.status = "concluded"
        self._notifier.notify_emergency_check_concluded(emergency_check)

    def update_user_status(self, emergency_id: str, user_uuid: str, status: UserState):
        emergency_check = self._emergencies[emergency_id]
        emergency_check.targeted_users[user_uuid] = status
        if status == "safe":
            logger.info("User %s confirmed safe", user_uuid)
            self._notifier.notify_user_confirmed_safe(
                tenant_uuid=emergency_check.tenant_uuid,
                user_uuid=user_uuid,
                emergency_check_id=emergency_id,
            )
        elif status == "reached":
            logger.info("User %s reached", user_uuid)
            self._notifier.notify_user_reached(
                tenant_uuid=emergency_check.tenant_uuid,
                user_uuid=user_uuid,
                emergency_check_id=emergency_id,
            )
        elif status == "unsafe":
            logger.info("User %s confirmed unsafe", user_uuid)
            self._notifier.notify_user_confirmed_unsafe(
                tenant_uuid=emergency_check.tenant_uuid,
                user_uuid=user_uuid,
                emergency_check_id=emergency_id,
            )
        else:
            logger.error("Unknown user state %s", status)
