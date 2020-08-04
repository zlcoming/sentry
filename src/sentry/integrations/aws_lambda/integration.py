from __future__ import absolute_import

import logging
import time

from django.utils.translation import ugettext_lazy as _


from sentry.integrations import (
    IntegrationInstallation,
    IntegrationFeatures,
    IntegrationProvider,
    IntegrationMetadata,
    FeatureDescription,
)
from sentry.pipeline import PipelineView
from sentry.shared_integrations.exceptions import IntegrationError
from sentry.web.helpers import render_to_response

logger = logging.getLogger("sentry.integrations.aws_lambda")

DESCRIPTION = """
The AWS Lambda integration will automatically instrument your Lambda functions without any code changes. All you need to do is run a CloudFormation stack that we provide to get started.
"""


FEATURES = [
    FeatureDescription(
        """
        Instrument your serverless code automatically.
        """,
        IntegrationFeatures.SERVERLESS,
    ),
]

metadata = IntegrationMetadata(
    description=DESCRIPTION.strip(),
    features=FEATURES,
    author="The Sentry Team",
    noun=_("Installation"),
    issue_url="https://github.com/getsentry/sentry/issues/new",
    source_url="https://github.com/getsentry/sentry/tree/master/src/sentry/integrations/aws_lambda",
    aspects={},
)


class AwsLambdaIntegration(IntegrationInstallation):
    pass


class AwsLambdaIntegrationProvider(IntegrationProvider):
    key = "aws_lambda"
    name = "AWS Lambda"
    # requires_feature_flag = True
    metadata = metadata
    integration_cls = AwsLambdaIntegration
    features = frozenset([IntegrationFeatures.SERVERLESS])

    def get_pipeline_views(self):
        return [AwsLambdaPipelineView()]

    def build_integration(self, state):
        # TODO: unhardcode
        account_id = "599817902985"
        region = "us-east-2"
        integration_name = "Serverless Hack Bootstrap"
        integration = {
            "name": integration_name,
            "external_id": account_id, # we might want the region as part of the external id
            "metadata": {
                "arn": state["arn"],
                "region": region,
                "account_id": account_id
            }
        }
        return integration


class AwsLambdaPipelineView(PipelineView):
    def dispatch(self, request, pipeline):
        if request.method == "POST":
            arn = request.POST["arn"]
            pipeline.bind_state("arn", arn)
            print("arn", arn)
            return pipeline.next_step()

        return render_to_response(
            template="sentry/integrations/aws-lambda-setup.html",
            request=request,
            context={
                "cloudformation_url": "google.com"
            }
        )
