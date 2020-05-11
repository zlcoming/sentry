from __future__ import absolute_import

from sentry.cache import legacy_redis_blaster_cache

from .base import BaseAttachmentCache


class DefaultAttachmentCache(BaseAttachmentCache):
    def __init__(self, **options):
        super(DefaultAttachmentCache, self).__init__(legacy_redis_blaster_cache, **options)
