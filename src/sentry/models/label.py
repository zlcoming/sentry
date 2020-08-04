from __future__ import absolute_import

from django.db import models

from sentry.db.models import Model, FlexibleForeignKey


class Label(Model):
    __core__ = False

    organization = FlexibleForeignKey("sentry.Organization")
    # label name
    name = models.CharField(max_length=100)
    # hexcode for color (maybe should have predefined set in future)
    color = models.CharField(max_length=6)
