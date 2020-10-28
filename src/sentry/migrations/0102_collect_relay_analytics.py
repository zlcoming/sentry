# -*- coding: utf-8 -*-
# Generated by Django 1.11.29 on 2020-09-16 08:42
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone
import sentry.db.models.fields.bounded


class Migration(migrations.Migration):
    # This flag is used to mark that a migration shouldn't be automatically run in
    # production. We set this to True for operations that we think are risky and want
    # someone from ops to run manually and monitor.
    # General advice is that if in doubt, mark your migration as `is_dangerous`.
    # Some things you should always mark as dangerous:
    # - Large data migrations. Typically we want these to be run manually by ops so that
    #   they can be monitored. Since data migrations will now hold a transaction open
    #   this is even more important.
    # - Adding columns to highly active tables, even ones that are NULL.
    is_dangerous = False

    # This flag is used to decide whether to run this migration in a transaction or not.
    # By default we prefer to run in a transaction, but for migrations where you want
    # to `CREATE INDEX CONCURRENTLY` this needs to be set to False. Typically you'll
    # want to create an index concurrently when adding one to an existing table.
    atomic = True

    dependencies = [("sentry", "0101_backfill_file_type_on_event_attachment")]

    operations = [
        migrations.CreateModel(
            name="RelayUsage",
            fields=[
                (
                    "id",
                    sentry.db.models.fields.bounded.BoundedBigAutoField(
                        primary_key=True, serialize=False
                    ),
                ),
                ("relay_id", models.CharField(max_length=64)),
                ("version", models.CharField(default="0.0.1", max_length=32)),
                ("first_seen", models.DateTimeField(default=django.utils.timezone.now)),
                ("last_seen", models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={"db_table": "sentry_relayusage"},
        ),
        migrations.AlterField(
            model_name="relay",
            name="first_seen",
            field=models.DateTimeField(default=None, null=True),
        ),
        migrations.AlterField(
            model_name="relay", name="is_internal", field=models.NullBooleanField(default=None)
        ),
        migrations.AlterField(
            model_name="relay",
            name="last_seen",
            field=models.DateTimeField(default=None, null=True),
        ),
        migrations.AlterUniqueTogether(
            name="relayusage", unique_together=set([("relay_id", "version")])
        ),
    ]
