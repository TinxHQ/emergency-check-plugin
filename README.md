# emergency-check-plugin

This plugin allows the administrator to launch an emergency safety check to be
sure that all users of a tenant are safe.

When a check is launched, a chat message can be sent to all users allowing them
to reply if they are safe. After a few seconds the user's mobile and mobile app
will also be called to prompt them for safety.

A dashboard allows the administrator to follow the status of each user.


## Installation

wazo-plugind-cli -c "install git https://github.com/tinxhq/emergency-check-plugin
