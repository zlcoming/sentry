from __future__ import absolute_import

from sentry.api.serializers import Serializer, register
from sentry.models import Label


@register(Label)
class LabelSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        return {"id": obj.id, "name": obj.name, "color": obj.color}
