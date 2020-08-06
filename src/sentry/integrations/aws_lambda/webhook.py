from __future__ import absolute_import

import logging
import json
import uuid

from base64 import b64decode
from django.views.decorators.csrf import csrf_exempt

from requests.exceptions import RequestException

from sentry import http
from sentry.api.base import Endpoint
from sentry.models import Project, ProjectKey
from sentry.utils.http import absolute_uri
from sentry.utils.strings import gunzip
from sentry.web.decorators import transaction_start

logger = logging.getLogger("sentry.integrations.aws_lambda.webhooks")

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
            unzipped_data = gunzip(b64decode(record["data"]))
            print("data", unzipped_data)
            data = json.loads(unzipped_data)
            session = http.build_session()

            if data["messageType"] == "DATA_MESSAGE":
                event = data["logEvents"][1]
                event_message = [line.strip() for line in event["message"].splitlines()]
                [message, exception_type] = event_message[0].split(": ")
                prev_index = event_message.index("Traceback (most recent call last):")
                frames = [line.strip() for line in event_message[prev_index + 1].split(",")]

                report = data["logEvents"][3]
                report_message = [line.strip() for line in report["message"].split("\t")][1:]

                contexts = {}
                for elem in report_message:
                    items = elem.split(": ")
                    if len(items) == 2:
                        contexts[items[0]] = items[1]

                print(contexts)
                pre_context = [
                    "import json",
                    "",
                    "def lambda_handler(event, context):",
                    "    # TODO implement",
                ]
                context_line = "    event.helloworldthree"
                post_context = [
                    "    return {",
                    "        'statusCode': 200,",
                    "        'body': json.dumps('Hello from Lambda!')",
                    "    }",
                ]
                payload = {
                    "event_id": uuid.uuid4().hex,
                    "message": {"message": message},
                    "exception": {"type": exception_type},
                    "stacktrace": {
                        "frames": [
                            {
                                "filename": frames[0].lstrip("File").strip().strip('"'),
                                "lineno": frames[1].lstrip("line").strip(),
                                "function": frames[2].lstrip("in").strip(),
                                "pre_context": pre_context,
                                "context_line": context_line,
                                "post_context": post_context,
                            }
                        ]
                    },
                    "contexts": {"AWS Lambda": contexts},
                }

                print("payload", payload)

                try:
                    resp = session.post(endpoint, json=payload)
                    json_error = resp.json()
                    resp.raise_for_status()
                except RequestException as e:
                    # errors here should be uncommon but we should be aware of them
                    logger.error(
                        "Error sending stacktrace from AWS Lambda to sentry: %s - %s"
                        % (e, json_error),
                        extra={
                            "project_id": project.id,
                            "project_public_key": project_key.public_key,
                        },
                        exc_info=True,
                    )

        return self.respond(status=200)


{
    "event_id": "bc892670fe0f46e5a9a786076fcf57c7",
    "stacktrace": {
        "frames": [
            {
                "function": "lambda_handler",
                "pre_context": [
                    "import json",
                    "",
                    "def lambda_handler(event, context):",
                    "    # TODO implement",
                ],
                "post_context": [
                    "    return {",
                    "        'statusCode': 200,",
                    "        'body': json.dumps('Hello from Lambda!')",
                    "    }",
                ],
                "filename": "/var/task/lambda_function.py",
                "lineno": "5",
                "context_line": "    event.helloworldthree",
            }
        ]
    },
    "message": {"message": "'dict' object has no attribute 'helloworldthree'"},
    "contexts": {
        "AWS Lambda": {
            "Duration": "0.55 ms",
            "Memory Size": "128 MB",
            "Billed Duration": "100 ms",
            "Max Memory Used": "43 MB",
        }
    },
    "exception": {"type": "AttributeError"},
}
