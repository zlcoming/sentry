from __future__ import absolute_import

from sentry.api.serializers import Serializer, register, serialize
from sentry.models import IssueLabel


@register(IssueLabel)
class IssueLabelSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        return serialize(obj.label)
