from __future__ import absolute_import

from datetime import timedelta
from django.utils import timezone

from sentry.data_export.models import ExportedData
from sentry.testutils import APITestCase


class DataExportListTest(APITestCase):
    endpoint = "sentry-api-0-organization-data-export-list"

    def setUp(self):
        self.user = self.create_user()
        self.first_org = self.create_organization(owner=self.user)
        self.second_org = self.create_organization(owner=self.user)
        self.login_as(user=self.user)
        for i in range(15):
            ExportedData.objects.create(
                user=self.user,
                organization=self.first_org,
                date_added=timezone.now() + timedelta(days=i),
                query_type=0,
                query_info={"env": "test"},
            )

    def test_simple(self):
        with self.feature("organizations:data-export"):
            response = self.get_valid_response(self.first_org.slug)
        assert isinstance(response.data, list)
        assert len(response.data) == 15

    def test_empty(self):
        with self.feature("organizations:data-export"):
            response = self.get_valid_response(self.second_org.slug)
        assert isinstance(response.data, list)
        assert len(response.data) == 0

    def test_order(self):
        with self.feature("organizations:data-export"):
            response = self.get_valid_response(self.first_org.slug)
        assert response.data[0]["dateCreated"] > response.data[1]["dateCreated"]
