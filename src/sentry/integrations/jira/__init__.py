from __future__ import absolute_import

from sentry.utils.imports import import_submodules
from sentry.rules import rules

from .notify_action import JiraNotifyServiceAction

import_submodules(globals(), __name__, __path__)

# TODO this adds jira to the dropdown?
rules.add(JiraNotifyServiceAction)
