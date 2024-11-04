# Copyright 2024 The Wazo Authors  (see the AUTHORS file)
# SPDX-License-Identifier: GPL-3.0-or-later

import logging
import re

from wazo_calld.bus import CoreBusConsumer

from .services import EmergencyCheckService

logger = logging.getLogger(__name__)

SAFE_CHAT_RESPONSE = re.compile(r"\b(safe|yes)\b")
UNSAFE_CHAT_RESPONSE = re.compile(r"\b(unsafe|no)\b")


class EventHandler:
    def __init__(self, service):
        self._service: EmergencyCheckService = service

    def subscribe(self, bus_consumer: CoreBusConsumer):
        bus_consumer.subscribe("chatd_user_room_message_created", self.on_chat_message)

    def on_chat_message(self, event):
        # NOTE: documentation lies, there is no room.name in event

        emergency_checks = list(
            emergency_check
            for emergency_check in self._service._emergencies.values()
            if emergency_check.tenant_uuid == event["tenant_uuid"]
            and event["room"]["uuid"] in emergency_check.chat_rooms
        )
        logger.debug(
            "%d matching emergency checks found for tenant(uuid=%s) and room(uuid=%s)",
            len(emergency_checks),
            event["tenant_uuid"],
            event["room"]["uuid"],
        )
        for emergency_check in emergency_checks:
            logger.info(
                "chat message in emergency check chat room (emergency_check.uuid=%s) (room.uuid=%s)",
                emergency_check.uuid,
                event["room"]["uuid"],
            )
            if emergency_check.status == "concluded":
                logger.debug(
                    "emergency check %s already concluded", emergency_check.uuid
                )
                continue

            if (
                event["user_uuid"]
                == self._service._system_users[event["tenant_uuid"]]["uuid"]
            ):
                logger.debug(
                    "ignoring message from emergency check system user %s",
                    event["user_uuid"],
                )
                return

            if event["user_uuid"] in emergency_check.targeted_users:
                message_content = event["content"]
                logger.info("User %s responded to emergency check", event["user_uuid"])
                emergency_check.targeted_users[event["user_uuid"]] = "reached"
                if SAFE_CHAT_RESPONSE.match(message_content):
                    self._service.update_user_status(
                        emergency_check.uuid, event["user_uuid"], "safe"
                    )
                elif UNSAFE_CHAT_RESPONSE.match(message_content):
                    self._service.update_user_status(
                        emergency_check.uuid, event["user_uuid"], "unsafe"
                    )
            else:
                logger.info("message from non-targeted user %s", event["user_uuid"])

            if all(
                user_state in {"safe"}
                for user_state in emergency_check.targeted_users.values()
            ):
                logger.info(
                    "All users confirmed safe, concluding emergency check %s",
                    emergency_check.uuid,
                )
                self._service.conclude_emergency_check(emergency_check.uuid)
