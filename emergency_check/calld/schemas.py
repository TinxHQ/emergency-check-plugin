# Copyright 2024 The Wazo Authors  (see the AUTHORS file)
# SPDX-License-Identifier: GPL-3.0-or-later

from marshmallow import Schema, fields
from marshmallow.validate import OneOf


class EmergencyCheckSpecSchema(Schema):
    emergency_type = fields.String(validate=OneOf(["fire"]))
    targeted_users = fields.List(
        fields.String(), default=None, allow_none=True, missing=None
    )


emergency_check_spec_schema = EmergencyCheckSpecSchema()
