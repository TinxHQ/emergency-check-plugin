# Copyright 2024 The Wazo Authors  (see the AUTHORS file)
# SPDX-License-Identifier: GPL-3.0-or-later

import logging

from .services import EmergencyCheckService
from .utils import EmergencyCheckState

from wazo_calld.bus import CoreBusConsumer
import re

logger = logging.getLogger(__name__)

SAFE_CHAT_RESPONSE = re.compile(r'\b(safe|yes)\b')
UNSAFE_CHAT_RESPONSE = re.compile(r'\b(unsafe|no)\b')


class EventHandler:
    def __init__(self, service):
        self._service: EmergencyCheckService = service

    def subscribe(self, bus_consumer: CoreBusConsumer):
        bus_consumer.subscribe(
            'chatd_user_room_message_created', self.on_chat_message
        )

    def on_chat_message(self, event):
        if "EMERGENCY CHECK" not in event['room']['name']:
            return

        logger.info('message in emergency check chat room')

        emergency_check: EmergencyCheckState = next(
            emergency_check
            for emergency_check in self._service.emergencies.values()
            if emergency_check.tenant_uuid == event['tenant_uuid']
            and emergency_check.chat_room == event['room']['uuid']
        )

        if emergency_check.status == 'concluded':
            return
        
        if event['user_uuid'] == self._service._system_users[event['tenant_uuid']]['uuid']:
            return
        
        if event['user_uuid'] in emergency_check.targeted_users:
            message_content = event['content']
            emergency_check.targeted_users[event['user_uuid']] = 'reached'
            if SAFE_CHAT_RESPONSE.match(message_content):
                emergency_check.targeted_users[event['user_uuid']] = 'safe'
            elif UNSAFE_CHAT_RESPONSE.match(message_content):
                emergency_check.targeted_users[event['user_uuid']] = 'unsafe'
        
        logger.info('message from non-targeted user %s', event['user_uuid'])

        if all(user_state in {'safe'} for user_state in emergency_check.targeted_users.values()):
            emergency_check.status = 'concluded'
