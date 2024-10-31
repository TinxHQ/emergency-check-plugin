# Copyright 2024 The Wazo Authors  (see the AUTHORS file)
# SPDX-License-Identifier: GPL-3.0-or-later

from __future__ import annotations

import logging
import os
import signal
from concurrent.futures import ThreadPoolExecutor

import requests.exceptions
from wazo_amid_client.client import AmidClient
from wazo_auth_client.client import AuthClient
from wazo_calld.types import PluginDependencies
from wazo_chatd_client.client import ChatdClient
from wazo_confd_client.client import ConfdClient

from .bus_consume import EventHandler
from .http import EmergencyCheck, EmergencyCheckItem
from .notifier import EmergencyCheckNotifier
from .services import EmergencyCheckService, EmergencyCheckState

logger = logging.getLogger(__name__)


def handle_pdb(sig, frame):
    import pdb

    pdb.Pdb().set_trace(frame)


EMERGENCIES = {}
THREADPOOL = ThreadPoolExecutor(thread_name_prefix="emergency_check_worker.")
SYSTEM_USERS = {}


class EmergencyCheckPlugin:
    def __init__(self):
        super().__init__()
        self.emergencies: dict[str, EmergencyCheckState] = EMERGENCIES
        self.threadpool = THREADPOOL

    def load(self, dependencies: PluginDependencies) -> None:
        logger.info("Loading emergency_check plugin")
        signal.signal(signal.SIGUSR1, handle_pdb)
        print(os.getpid())

        ari = dependencies["ari"]
        bus_consumer = dependencies["bus_consumer"]
        token_changed_subscribe = dependencies["token_changed_subscribe"]
        next_token_changed_subscribe = dependencies["next_token_changed_subscribe"]
        config = dependencies["config"]
        bus_publisher = dependencies["bus_publisher"]

        amid_client = AmidClient(**config["amid"])
        token_changed_subscribe(amid_client.set_token)

        auth_client = AuthClient(**config["auth"])

        def set_token(token):
            logger.info("setting new auth_client token %s", token)
            auth_client.set_token(token)

        token_changed_subscribe(set_token)

        confd_client = ConfdClient(**config["confd"])
        token_changed_subscribe(confd_client.set_token)

        def create_tenant_users(token):
            auth_client.set_token(token)
            confd_client.set_token(token)
            tenants = auth_client.tenants.list()["items"]
            logger.info("Creating emergency-check users in %d tenants", len(tenants))
            for tenant in tenants:
                username = f'emergency-check+{tenant["slug"]}@wazo.io'
                if users := confd_client.users.list(
                    tenant_uuid=tenant["uuid"], firstname="emergency-check"
                )["items"]:
                    # for user in users:
                    #     confd_client.session().delete(
                    #         f'/users/{user["uuid"]}',
                    #         params={'recursive': True},
                    #         headers={
                    #             **confd_client.READ_HEADERS,
                    #             'X-Auth-Token': confd_client._token_id,
                    #             'Wazo-Tenant': tenant['uuid']
                    #         }
                    #     )
                    #     auth_client.users.delete(user['uuid'])
                    SYSTEM_USERS[tenant["uuid"]] = users[0]
                elif tenant["slug"] != "master":
                    logger.info(
                        "Creating emergency-check user in tenant %s", tenant["uuid"]
                    )
                    try:
                        user = confd_client.users.create(
                            {
                                "firstname": "emergency-check",
                                "lastname": "",
                                "email": username,
                                "auth": {
                                    "username": username,
                                    "password": "superpass",
                                    "purpose": "user",
                                    "enabled": True,
                                },
                            },
                            tenant_uuid=tenant["uuid"],
                        )
                    except requests.exceptions.HTTPError:
                        logger.exception(
                            "Failed to create emergency-check user in tenant %s",
                            tenant["uuid"],
                        )
                        continue
                    else:
                        SYSTEM_USERS[tenant["uuid"]] = user

            assert all(
                tenant["uuid"] in SYSTEM_USERS
                for tenant in tenants
                if tenant["slug"] != "master"
            ), SYSTEM_USERS

            logger.info("Done creating emergency-check users in each tenant")

        next_token_changed_subscribe(create_tenant_users)

        chatd_client = ChatdClient(**config["chatd"])
        # token_changed_subscribe(chatd_client.set_token)
        notifier = EmergencyCheckNotifier(bus_publisher)
        service = EmergencyCheckService(
            self.threadpool,
            self.emergencies,
            ari,
            notifier,
            amid_client,
            auth_client,
            confd_client,
            chatd_client,
            system_users=SYSTEM_USERS,
        )
        event_handler = EventHandler(service)

        event_handler.subscribe(bus_consumer)

        api = dependencies["api"]

        api.add_resource(EmergencyCheck, "/emergency", resource_class_args=[service])

        api.add_resource(
            EmergencyCheckItem,
            "/emergency/<uuid:emergency_id>",
            resource_class_args=[service],
        )

        logger.info("Loaded emergency_check plugin http resource")

        dependencies["pubsub"].subscribe(
            "stopping", lambda _: self.threadpool.shutdown()
        )
