#!/usr/bin/env python3
# Copyright 2023 The Wazo Authors  (see the AUTHORS file)
# SPDX-License-Identifier: GPL-3.0-or-later

import yaml

from setuptools import find_packages
from setuptools import setup

with open('wazo/plugin.yml') as file:
    metadata = yaml.load(file)

calld_entrypoints = {
    'wazo_calld.plugins': [
        'emergency_check = emergency_check.plugins.calld:EmergencyCheckPlugin',
    ]
}

setup(
    name=metadata['name'],
    version=metadata['version'],
    description=metadata['display_name'],
    author=metadata['author'],
    url=metadata['homepage'],

    packages=find_packages(),
    include_package_data=True,
    package_data={
        'emergency_check.plugins.calld': ['api.yml'],
    },
    entry_points=dict(
        **calld_entrypoints,
    ),
)
