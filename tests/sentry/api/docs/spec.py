from __future__ import absolute_import

from openapi_core import create_spec

import re
import os
from sentry.utils import json
from openapi_core.validation.response.datatypes import OpenAPIResponse

from openapi_core.validation.request.datatypes import (
    RequestParameters,
    OpenAPIRequest,
)

# https://docs.djangoproject.com/en/2.2/topics/http/urls/
#
# Currently unsupported are :
#   - nested arguments, e.g.: ^comments/(?:page-(?P<page_number>\d+)/)?$
#   - unnamed regex groups, e.g.: ^articles/([0-9]{4})/$
#   - multiple named parameters between a single pair of slashes
#     e.g.: <page_slug>-<page_id>/edit/
#
# The regex matches everything, except a "/" until "<". Than only the name
# is exported, after which it matches ">" and everything until a "/".
PATH_PARAMETER_PATTERN = r"(?:[^\/]*?)<(?:(?:.*?:))*?(\w+)>(?:[^\/]*)"


class DjangoOpenAPIRequest(object):

    path_regex = re.compile(PATH_PARAMETER_PATTERN)

    @classmethod
    def create(cls, request, method, headers):
        # import pdb; pdb.set_trace()
        method = method.lower()
        path = request.path

        parameters = RequestParameters(
            path=path, query=request.GET, header=headers, cookie=request.COOKIES,
        )
        return OpenAPIRequest(
            full_url_pattern=request.build_absolute_uri(),
            method=method,
            parameters=parameters,
            body=request.body,
            mimetype=request.content_type,
        )


class DjangoOpenAPIResponse(object):
    @classmethod
    def create(cls, response):
        mimetype = response.get("Content-Type")
        return OpenAPIResponse(
            data=response.content,
            status_code=response.status_code,
            mimetype=mimetype or "application/json",
        )


def create_doc_schema():
    spec = None
    path = os.path.join(os.path.dirname(__file__)) + "/spec.json"
    with open(path) as json_file:
        data = json.load(json_file)
        spec = create_spec(data)

    json_file.close()

    return spec
