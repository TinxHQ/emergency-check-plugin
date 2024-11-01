# Copyright 2024 The Wazo Authors  (see the AUTHORS file)
# SPDX-License-Identifier: GPL-3.0-or-later

import logging
from dataclasses import asdict

from flask import request
from wazo_calld.auth import required_acl
from wazo_calld.http import AuthResource
from xivo.tenant_flask_helpers import Tenant, token

from .schemas import emergency_check_spec_schema
from .services import EmergencyCheckService

logger = logging.getLogger(__name__)


class EmergencyCheck(AuthResource):
    def __init__(self, service: EmergencyCheckService):
        logger.info("Instantiated /emergency view")
        self.service = service

    @required_acl("calld.emergency.create")
    def post(self):
        tenant = Tenant.autodetect()

        emergency_check_params = emergency_check_spec_schema.load(request.json)
        emergency_check_id = self.service.create_emergency_check(
            **emergency_check_params, user_uuid=token.user_uuid, tenant_uuid=tenant.uuid
        )
        return {"emergency_id": emergency_check_id}, 201

    def get(self):
        tenant = Tenant.autodetect()
        return {
            "items": [
                asdict(emergency) for emergency in self.service.emergencies[tenant.uuid]
            ],
            "total": len(self.service.list_emergencies(tenant.uuid)),
        }


class EmergencyCheckItem(AuthResource):
    def __init__(self, service: EmergencyCheckService):
        logger.info("Instantiated /emergency/<emergency_id> view")
        self.service = service

    @required_acl("calld.emergency.read")
    def get(self, emergency_id):
        tenant = Tenant.autodetect()

        emergency_check_state = self.service.get_emergency_check_state(
            str(emergency_id), tenant_uuid=tenant.uuid
        )

        return asdict(emergency_check_state), 200


# class EmergencyCheckStatus(AuthResource):
#     def __init__(self, service: EmergencyCheckService):
#         # logger.info('Instantiated /emergency/<emergency_id> view')
#         self.service = service

#     @required_acl("calld.emergency.status.update")
#     def put(self, state):
#         tenant = Tenant.autodetect()

#         assert state in ["aborted"]

#         emergency_check_state = self.service.get_emergency_check_state(
#             str(emergency_id), tenant_uuid=tenant.uuid
#         )

#         return asdict(emergency_check_state), 200
