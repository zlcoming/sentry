from __future__ import absolute_import

import boto3
import logging
import uuid
import os

from botocore.config import Config
from django.utils.translation import ugettext_lazy as _


from sentry import options
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

# Taken from: https://gist.github.com/gene1wood/5299969edc4ef21d8efcfea52158dd40
def parse_arn(arn):
    # http://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html
    elements = arn.split(":", 5)
    result = {
        "arn": elements[0],
        "partition": elements[1],
        "service": elements[2],
        "region": elements[3],
        "account": elements[4],
        "resource": elements[5],
        "resource_type": None,
    }
    if "/" in result["resource"]:
        result["resource_type"], result["resource"] = result["resource"].split("/", 1)
    elif ":" in result["resource"]:
        result["resource_type"], result["resource"] = result["resource"].split(":", 1)
    return result


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
        return [AwsLambdaPipelineView(), SetupSubscriptionView()]

    def build_integration(self, state):
        # TODO: unhardcode
        integration_name = "Serverless Hack Bootstrap"

        arn = state["arn"]
        parsed_arn = parse_arn(arn)
        account_id = parsed_arn["account"]

        integration = {
            "name": integration_name,
            "external_id": account_id,  # we might want the region as part of the external id
            "metadata": {"arn": state["arn"],},
        }
        return integration


class AwsLambdaPipelineView(PipelineView):
    def dispatch(self, request, pipeline):

        # arn = "arn:aws:cloudformation:us-west-2:610179610581:stack/Sentry-Monitoring-Stack-Filter/93124870-d800-11ea-b0e1-02b037911a52"
        # external_id = "2d748e18-dcc3-403c-9f38-75d3aaf3b092"
        # pipeline.bind_state("arn", arn)
        # pipeline.bind_state("external_id", external_id)
        # print("arn", arn)
        # return pipeline.next_step()

        if request.method == "POST":
            arn = request.POST["arn"]
            external_id = request.POST["external_id"]
            pipeline.bind_state("arn", arn)
            pipeline.bind_state("external_id", external_id)
            print("arn", arn)
            return pipeline.next_step()


        template_url = (
            "https://sentry-cf-stack-template.s3-us-west-2.amazonaws.com/sentryCFStackFilter.json"
        )
        external_id = uuid.uuid4()
        # pipeline.bind_state("external_id", external_id)
        cloudformation_url = (
            "https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?"
            "stackName=Sentry-Monitoring-Stack-Filter&templateURL=%s&param_ExternalId=%s"
            % (template_url, external_id)
        )

        return render_to_response(
            template="sentry/integrations/aws-lambda-setup.html",
            request=request,
            context={"cloudformation_url": cloudformation_url, "external_id": external_id},
        )



class SetupSubscriptionView(PipelineView):
    def dispatch(self, request, pipeline):
        arn = pipeline.fetch_state("arn")

        # TODO: unhardcode
        external_id = pipeline.fetch_state("external_id")

        print("external_id", external_id)

        parsed_arn = parse_arn(arn)
        account_id = parsed_arn["account"]
        region = parsed_arn["region"]

        role_arn = "arn:aws:iam::%s:role/SentryRole"%(account_id)

        # this needs to either be done in a loop or in the SNS callback
        client = boto3.client(
            service_name="sts",
            aws_access_key_id=options.get("aws-lambda.access-key-id"),
            aws_secret_access_key=options.get("aws-lambda.secret-access-key"),
            region_name=options.get("aws-lambda.region"),
        )

        assumed_role_object = client.assume_role(
            RoleSessionName="MySession", RoleArn=role_arn, ExternalId=external_id
        )

        credentials = assumed_role_object["Credentials"]

        tmp_access_key = credentials['AccessKeyId']
        tmp_secret_key = credentials['SecretAccessKey']
        security_token = credentials['SessionToken']

        boto3_session = boto3.Session(
            aws_access_key_id=tmp_access_key,
            aws_secret_access_key=tmp_secret_key, aws_session_token=security_token
        )

        labmda_client = boto3_session.client(service_name='lambda', region_name=region)
        log_client = boto3_session.client(service_name='logs', region_name=region)

        lambda_functions = labmda_client.list_functions()
        print("response", lambda_functions)



        for function in lambda_functions["Functions"]:
            name = function["FunctionName"]
            log_group = "/aws/lambda/%s"%(name)
            # sub_filters = log_client.describe_subscription_filters(
            #     logGroupName=log_group,
            # )
            # for sub_filter in sub_filters["subscriptionFilters"]:
            #     response = log_client.delete_subscription_filter(
            #         logGroupName=log_group,
            #         filterName=
            #     )

            print("log_group", log_group)

            # log_client.put_subscription_filter(
            #     logGroupName=log_group,
            #     filterName='SentryMasterStream',
            #     filterPattern='',
            #     destinationArn='arn:aws:logs:us-east-2:599817902985:destination:SteveDestinationMaster',
            # )


        return pipeline.next_step()
