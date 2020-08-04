from __future__ import absolute_import

from base64 import b64decode
from django.views.decorators.csrf import csrf_exempt

from sentry import http, options
from sentry.api.base import Endpoint
from sentry.models import Project, ProjectKey
from sentry.utils.http import absolute_uri
from sentry.utils.strings import gunzip
from sentry.web.decorators import transaction_start


# Example error:
# {
#   "errorType": "TypeError",
#   "errorMessage": "Cannot read property 'lol' of undefined",
#   "trace": [
#     "TypeError: Cannot read property 'lol' of undefined",
#     "    at Runtime.exports.handler (/var/task/index.js:3:15)",
#     "    at Runtime.handleOnce (/var/runtime/Runtime.js:66:25)"
#   ]
# }

# Python
# {
#   "errorMessage": "'dict' object has no attribute 'lol'",
#   "errorType": "AttributeError",
#   "stackTrace": [
#     [
#       "/var/task/lambda_function.py",
#       5,
#       "lambda_handler",
#       "event.lol.lol"
#     ]
#   ]
# }

# hard coded to the first org you have (should work in a dev environment)
ORG_ID = 1


class AwsLambdaWebhookEndpoint(Endpoint):
    authentication_classes = ()
    permission_classes = ()

    @csrf_exempt
    def dispatch(self, request, *args, **kwargs):
        return super(AwsLambdaWebhookEndpoint, self).dispatch(request, *args, **kwargs)

    @transaction_start("AwsLambdaWebhookEndpoint")
    def post(self, request):
        print(request.body)

        # TODO: differnet way of getting the project id
        project = Project.objects.filter(organization_id=ORG_ID, status=0).first()
        project_key = ProjectKey.get_default(project=project)
        endpoint = absolute_uri(
            "/api/%d/store/?sentry_key=%s" % (project.id, project_key.public_key)
        )
        print("endpoint", endpoint)

        for record in request.data["records"]:
            # decode and un-gzip data
            data = gunzip(b64decode(record["data"]))
            print("data", data)

            session = http.build_session()

        return self.respond(status=200)
