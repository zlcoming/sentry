from __future__ import absolute_import

from django.contrib.auth.models import AnonymousUser
from sentry.utils.performance.stopwatch import Stopwatch, global_stopwatch

registry = {}

log_counter = -1


def serialize(objects, user=None, serializer=None, **kwargs):
    global log_counter
    watch = None
    if log_counter >= 0:
        log_counter += 1
        prefix = "  [Serialization {}]".format(log_counter)
        global_stopwatch.mark("Initiating {} on {} {}".format(prefix, type(objects), "-" * 40))
        watch = Stopwatch(prefix).start()

    def mark(message):
        if watch:
            watch.mark(message)

    mark("Begin: {0!r}".format(objects))

    if user is None:
        user = AnonymousUser()

    if not objects:
        return objects
    # sets aren't predictable, so generally you should use a list, but it's
    # supported out of convenience
    elif not isinstance(objects, (list, tuple, set, frozenset)):
        return serialize([objects], user=user, serializer=serializer, **kwargs)[0]

    if serializer is None:
        # find the first object that is in the registry
        for o in objects:
            try:
                serializer = registry[type(o)]
                break
            except KeyError:
                pass
        else:
            return objects

    mark("Getting base attrs")
    item_list = [o for o in objects if o is not None]
    attrs = serializer.get_attrs(
        # avoid passing NoneType's to the serializer as they're allowed and
        # filtered out of serialize()
        item_list=item_list,
        user=user,
        **kwargs
    )
    mark("Done getting base attrs")

    serialized_objects = []
    for i, o in enumerate(objects):
        mark("({0}) Recursing on {1!r}".format(i, o))
        o_attrs = attrs.get(o, {})
        mark("({0}) Got attrs: {1!r}".format(i, o_attrs))
        serialized_group = serializer(o, attrs=o_attrs, user=user, **kwargs)
        mark("({0}) Done serializing".format(i, o_attrs))
        serialized_objects.append(serialized_group)
    mark("Done recursing")
    return serialized_objects


def register(type):
    def wrapped(cls):
        registry[type] = cls()
        return cls

    return wrapped


class Serializer(object):
    def __call__(self, obj, attrs, user, **kwargs):
        if obj is None:
            return
        return self.serialize(obj, attrs, user, **kwargs)

    def get_attrs(self, item_list, user, **kwargs):
        return {}

    def serialize(self, obj, attrs, user, **kwargs):
        return {}
