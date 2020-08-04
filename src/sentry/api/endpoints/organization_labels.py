from __future__ import absolute_import

from rest_framework import status
from rest_framework.response import Response

from django.db import transaction

from sentry.models import Label, IssueLabel
from sentry.api.paginator import OffsetPaginator
from sentry.api.bases.organization import OrganizationEndpoint
from sentry.api.serializers import serialize
from sentry.api.serializers.rest_framework.base import CamelSnakeModelSerializer


class LabelSerializer(CamelSnakeModelSerializer):
    class Meta:
        model = Label
        fields = ["name", "color"]

    def create(self, validated_data):
        with transaction.atomic():
            label = Label.objects.create(
                organization=self.context["organization"],
                name=validated_data["name"],
                color=validated_data["color"],
            )
            return label


class IssueLabelSerializer(CamelSnakeModelSerializer):
    class Meta:
        model = IssueLabel
        fields = ["label", "issue"]

    def create(self, validated_data):
        with transaction.atomic():
            issue_label = IssueLabel.objects.create(
                label=validated_data["label"], issue=validated_data["issue"]
            )
            return issue_label


class OrganizationLabelEndpoint(OrganizationEndpoint):
    def get(self, request, organization):
        """
        Fetches all labels within the org
        """
        labels = Label.objects.filter(organization=organization).distinct()

        return self.paginate(
            request,
            queryset=labels,
            paginator_cls=OffsetPaginator,
            on_results=lambda x: serialize(x, request.user),
            default_per_page=25,
        )

    def post(self, request, organization):
        """
        Create a new label for the organization

        :pparam string name: The label's name
        :pparam string color: The color of the label
        """
        data = request.data

        serializer = LabelSerializer(data=data, context={"organization": organization})

        if serializer.is_valid():
            label = serializer.save()
            return Response(serialize(label, request.user), status=status.HTTP_201_CREATED)

        return Response(status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, organization):
        """
        Place a label onto an issue or unassign if it already exists

        :pparam string issueId: The id of the issue
        :pparam string labelId: The id of the label
        """
        data = request.data
        if "issueId" not in data or "labelId" not in data:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        issue_label_data = {"label": int(data["labelId"]), "issue": int(data["issueId"])}

        # if the label exists we remove it
        existing_label = IssueLabel.objects.filter(**issue_label_data)
        if existing_label:
            existing_label.delete()
            return Response(status=status.HTTP_200_OK)

        serializer = IssueLabelSerializer(data=issue_label_data)

        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)

        return Response(status=status.HTTP_400_BAD_REQUEST)
