# Copyright 2019-2024 The Wazo Authors  (see the AUTHORS file)
# SPDX-License-Identifier: GPL-3.0-or-later

from __future__ import annotations

from wazo_amid_client import Client as AmidClient
from wazo_auth_client import Client as AuthClient

from wazo_calld.types import PluginDependencies

from .bus_consume import EventHandler
from .notifier import EmergencyCheckNotifier
from .services import EmergencyCheckService, EmergencyCheckState


class EmergencyCheckPlugin:
    def __init__(self):
        self.emergencies: dict[str, EmergencyCheckState] = {}

    def load(self, dependencies: PluginDependencies) -> None:
        ari = dependencies['ari']
        bus_consumer = dependencies['bus_consumer']
        token_changed_subscribe = dependencies['token_changed_subscribe']
        config = dependencies['config']
        bus_publisher = dependencies['bus_publisher']

        amid_client = AmidClient(**config['amid'])
        token_changed_subscribe(amid_client.set_token)

        auth_client = AuthClient(**config['auth'])
        token_changed_subscribe(auth_client.set_token)

        notifier = EmergencyCheckNotifier(bus_publisher)
        service = EmergencyCheckService(self.emergencies, ari, notifier, amid_client, auth_client)
        # stasis = DialMobileStasis(ari, service)
        event_handler = EventHandler(service)

        event_handler.subscribe(bus_consumer)

        api = dependencies['api']
        
        api.add_resource(
            EmergencyCheck, '/emergency', resource_class_args=[service]
        )
