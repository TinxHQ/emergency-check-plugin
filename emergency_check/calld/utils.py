# Copyright 2024 The Wazo Authors  (see the AUTHORS file)
# SPDX-License-Identifier: GPL-3.0-or-later
from __future__ import annotations

from dataclasses import dataclass,field
from typing import Literal
from concurrent.futures import Future

UserState = Literal['pending', 'reached', 'safe', 'unsafe']
EmergencyType = Literal['fire', 'earthquake', 'violence', 'storm']
EmergencyCheckStatus = Literal['started', 'concluded', 'aborted']

@dataclass
class EmergencyCheckState:
    status: EmergencyCheckStatus
    timestamp: float
    originator: str
    targeted_users: dict[str, UserState]
    emergency_type: str
    uuid: str
    tenant_uuid: str
    chat_room: str | None = None
    futures: list[Future] = field(default_factory=list)
