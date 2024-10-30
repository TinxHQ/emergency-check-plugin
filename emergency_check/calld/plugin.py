# Copyright 2024 The Wazo Authors  (see the AUTHORS file)
# SPDX-License-Identifier: GPL-3.0-or-later

from __future__ import annotations

import logging

from wazo_amid_client.client import AmidClient
from wazo_auth_client.client import AuthClient
from wazo_confd_client.client import ConfdClient
from wazo_chatd_client.client import ChatdClient

from wazo_calld.types import PluginDependencies
import signal
import os
import requests.exceptions

from .bus_consume import EventHandler
from .notifier import EmergencyCheckNotifier
from .services import EmergencyCheckService, EmergencyCheckState
from .http import EmergencyCheck, EmergencyCheckItem

from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

def handle_pdb(sig, frame):
    import pdb
    pdb.Pdb().set_trace(frame)


EMERGENCIES = {}
THREADPOOL = ThreadPoolExecutor(thread_name_prefix='emergency_check_worker.')


class EmergencyCheckPlugin:
    def __init__(self):
        super().__init__()
        self.emergencies: dict[str, EmergencyCheckState] = EMERGENCIES
        self.threadpool = THREADPOOL

    def load(self, dependencies: PluginDependencies) -> None:
        logger.info('Loading emergency_check plugin')
        signal.signal(signal.SIGUSR1, handle_pdb)
        print(os.getpid())

        ari = dependencies['ari']
        bus_consumer = dependencies['bus_consumer']
        token_changed_subscribe = dependencies['token_changed_subscribe']
        next_token_changed_subscribe = dependencies['next_token_changed_subscribe']
        config = dependencies['config']
        bus_publisher = dependencies['bus_publisher']

        amid_client = AmidClient(**config['amid'])
        token_changed_subscribe(amid_client.set_token)

        auth_client = AuthClient(**config['auth'])
        def set_token(token):
            logger.info('setting new auth_client token %s', token)
            auth_client.set_token(token)

        token_changed_subscribe(set_token)

        confd_client = ConfdClient(**config['confd'])
        token_changed_subscribe(confd_client.set_token)

        def create_tenant_users(token):
            auth_client.set_token(token)
            confd_client.set_token(token)

            for tenant in auth_client.tenants.list()['items']:
                username = f'emergency-check+{tenant["slug"]}@wazo.io'
                if (users := confd_client.users.list(tenant_uuid=tenant['uuid'], username=username)['items']):
                    for user in users:
                        confd_client.session().delete(
                            f'/users/{user["uuid"]}',
                            params={'recursive': True},
                            headers={
                                **confd_client.READ_HEADERS,
                                'X-Auth-Token': confd_client._token_id,
                                'Wazo-Tenant': tenant['uuid']
                            }
                        )
                if tenant['slug'] != 'master':
                    logger.info('Creating emergency-check user in tenant %s', tenant['uuid'])
                    try:
                        confd_client.users.create(
                            {
                                'firstname': 'emergency-check',
                                'lastname': '',
                                'auth': {
                                    'username': username,
                                    'password': 'superpass',
                                    'purpose': 'internal',
                                    'enabled': True
                                }
                            },
                            tenant_uuid=tenant['uuid']
                        )
                    except requests.exceptions.HTTPError:
                        logger.exception('Failed to create emergency-check user in tenant %s', tenant['uuid'])
                        continue
            logger.info('Done creating emergency-check users in each tenant')

        next_token_changed_subscribe(create_tenant_users)

        chatd_client = ChatdClient(**config['chatd'])
        # token_changed_subscribe(chatd_client.set_token)

        notifier = EmergencyCheckNotifier(bus_publisher)
        service = EmergencyCheckService(
            self.threadpool, self.emergencies, ari, notifier, amid_client, 
            auth_client, confd_client, chatd_client
        )
        event_handler = EventHandler(service)

        event_handler.subscribe(bus_consumer)

        api = dependencies['api']
        
        api.add_resource(
            EmergencyCheck, '/emergency',
            resource_class_args=[service]
        )

        api.add_resource(
            EmergencyCheckItem, '/emergency/<uuid:emergency_id>',
            resource_class_args=[service]
        )

        logger.info('Loaded emergency_check plugin http resource')

        dependencies['pubsub'].subscribe('stopping', lambda _: self.threadpool.shutdown())
