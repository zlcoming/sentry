from __future__ import absolute_import

from django.conf.urls import url

from .webhook import AwsLambdaWebhookEndpoint


urlpatterns = [
    url(r"^webhook/$", AwsLambdaWebhookEndpoint.as_view())
]
