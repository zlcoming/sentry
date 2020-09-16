# -*- coding: utf-8 -*-

from __future__ import absolute_import

import datetime

from django.core.urlresolvers import reverse
from openapi_core.validation.response.validators import ResponseValidator

from sentry.models import Deploy, Environment, Release
from sentry.testutils import APITestCase
from .spec import DjangoOpenAPIResponse, DjangoOpenAPIRequest, create_doc_schema


class ReleaseDeploysDocs(APITestCase):
    def test_simple(self):
        project = self.create_project(name="foo")
        release = Release.objects.create(
            organization_id=project.organization_id,
            # test unicode
            version="1–0",
        )
        release.add_project(project)
        Deploy.objects.create(
            environment_id=Environment.objects.create(
                organization_id=project.organization_id, name="production"
            ).id,
            organization_id=project.organization_id,
            release=release,
            date_finished=datetime.datetime.utcnow() - datetime.timedelta(days=1),
        )
        Deploy.objects.create(
            environment_id=Environment.objects.create(
                organization_id=project.organization_id, name="staging"
            ).id,
            organization_id=project.organization_id,
            release=release,
        )

        url = reverse(
            "sentry-api-0-organization-release-deploys",
            kwargs={"organization_slug": project.organization.slug, "version": release.version},
        )

        self.login_as(user=self.user)

        response = self.client.get(url)

        spec = create_doc_schema()
        openapi_response = DjangoOpenAPIResponse.create(response)
        openapi_request = DjangoOpenAPIRequest.create(
            response.wsgi_request, "GET", response._headers
        )
        validator = ResponseValidator(spec)
        result = validator.validate(openapi_request, openapi_response)
        result.raise_for_errors()
        assert result.errors == []
