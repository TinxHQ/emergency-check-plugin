# Copyright 2024 The Wazo Authors  (see the AUTHORS file)
# SPDX-License-Identifier: GPL-3.0-or-later

from dataclasses import asdict

from wazo_bus.resources.common.event import TenantEvent, UserEvent

from .utils import EmergencyCheckState


class UserReachedEvent(UserEvent):
    name = "emergency_check_user_reached"
    routing_key_fmt = "emergency_check.user.{user_uuid}.reached"

    def __init__(self, line_id, tenant_uuid, user_uuid):
        super().__init__(
            {
                "line_id": int(line_id),
            },
            tenant_uuid,
            user_uuid,
        )


class UserConfirmedSafetyEvent(UserEvent):
    name = "emergency_check_user_confirmed_safe"
    routing_key_fmt = "emergency_check.user.{user_uuid}.confirmed_safe"

    def __init__(self, line_id, tenant_uuid, user_uuid):
        super().__init__(
            {
                "line_id": int(line_id),
            },
            tenant_uuid,
            user_uuid,
        )


class EmergencyCheckInitiatedEvent(TenantEvent):
    name = "emergency_check_initiated"
    routing_key_fmt = "emergency_check.initiated"

    def __init__(self, emergency_check: EmergencyCheckState):
        super().__init__(asdict(emergency_check), emergency_check.tenant_uuid)


class EmergencyCheckNotifier:
    def __init__(self, bus_producer):
        self._bus_producer = bus_producer

    def notify_user_reached(self, line_id, tenant_uuid, user_uuid):
        event = UserReachedEvent(line_id, tenant_uuid, user_uuid)
        self._bus_producer.publish(event)

    def notify_user_confirmed_safe(self, line_id, tenant_uuid, user_uuid):
        event = UserConfirmedSafetyEvent(line_id, tenant_uuid, user_uuid)
        self._bus_producer.publish(event)

    def notify_emergency_check(self, emergency_check: EmergencyCheckState):
        event = EmergencyCheckInitiatedEvent(emergency_check)
        self._bus_producer.publish(event)
