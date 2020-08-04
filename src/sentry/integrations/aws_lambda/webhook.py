from __future__ import absolute_import

from base64 import b64decode
from django.views.decorators.csrf import csrf_exempt

from sentry import http, options
from sentry.api.base import Endpoint
from sentry.utils.strings import gunzip
from sentry.web.decorators import transaction_start

  "trace": [
    "TypeError: Cannot read property 'lol' of undefined",
    "    at Runtime.exports.handler (/var/task/index.js:3:15)",
    "    at Runtime.handleOnce (/var/runtime/Runtime.js:66:25)"
  ]


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

SENTRY_DSN = "https://f143df50c3f5433d88b574f7199b715d@scefali.ngrok.io/25"
ENDPOINT = "https://scefali.ngrok.io/api/25/store/?sentry_key=f143df50c3f5433d88b574f7199b715d"


class AwsLambdaWebhookEndpoint(Endpoint):
    authentication_classes = ()
    permission_classes = ()

    @csrf_exempt
    def dispatch(self, request, *args, **kwargs):
        return super(AwsLambdaWebhookEndpoint, self).dispatch(request, *args, **kwargs)


    @transaction_start("AwsLambdaWebhookEndpoint")
    def post(self, request):
        print(request.body)
        for record in request.data["records"]:
            # decode and un-gzip data
            data = gunzip(b64decode(record["data"]))
            print("data", data)
            
            session = http.build_session()



        return self.respond(status=200)
