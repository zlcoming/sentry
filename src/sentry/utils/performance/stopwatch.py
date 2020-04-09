from __future__ import absolute_import

import time

import click


class Stopwatch(object):
    """Measures elapsed time since a given starting event.

    This is a total kludge and should be used only temporarily and only
    in a development context. For production monitoring, use better
    tools such as Sentry's performance features.
    """

    def __init__(self, prefix):
        self.start_time = None
        self.prefix = prefix

    def start(self):
        self.start_time = time.time()
        return self

    def mark(self, message):
        if self.start_time is None:
            raise ValueError("Not started")
        elapsed = time.time() - self.start_time
        click.echo(u"{0} {1:>8.3f} ms: {2}".format(self.prefix, elapsed * 1000, message))


global_stopwatch = Stopwatch(u"\u23f1\ufe0f")
