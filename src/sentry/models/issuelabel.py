from __future__ import absolute_import

from sentry.db.models import Model, FlexibleForeignKey


class IssueLabel(Model):
    __core__ = False

    label = FlexibleForeignKey("sentry.Label")
    issue = FlexibleForeignKey("sentry.Group")
