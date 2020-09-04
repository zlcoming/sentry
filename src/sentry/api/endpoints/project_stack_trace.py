from __future__ import absolute_import

# import re
from six.moves.urllib.parse import quote

from sentry.api.bases.project import ProjectEndpoint
from sentry.models import Integration, Repository
from sentry.integrations.github.client import GitHubAppsClient

# from sentry.integrations.gitlab.client import GitLabApiClient
from sentry.integrations.gitlab.integration import GitlabIntegration
from sentry.shared_integrations.exceptions import ApiError


# TODO: Fix horrible hack
def percent_encode(val):
    # see https://en.wikipedia.org/wiki/Percent-encoding
    return quote(val.encode("utf8", errors="replace")).replace("%7E", "~").replace("/", "%2F")


def get_repo_and_relative_path_from_project(project, file):
    # organization = project.organization
    # local
    if project.slug == "react":
        return (
            "scefali/sentry-demo-react",
            file.replace("/Users/scefali/Work/sentry-demo-react/", ""),
        )
    if project.slug == "gitlab":
        return (
            "test-sentry1/hello",
            file.replace("/Users/scefali/Work/sentry-demo-react/", ""),
        )

    # prod
    if project.slug == "xc-prod":
        return ("picmonkey/picmonkey", file.replace("./src", "xc/src"))
    if project.slug == "api-production":
        return ("convoyinc/shipotle-api", file.replace("/shipotle-api/", ""))
    if project.slug == "tego-production":
        return ("Zegocover/tego", u"zego-backend/{}".format(file))
    if project.slug == "reviewpush-dashboard":
        return ("reviewpush/php/ReviewPushDashboard", file.rstrip("/"))
    if project.slug == "frontend":
        return ("flywheel-io/product/frontend/frontend", file.replace("./src", "app/src"))
    if project.slug == "m-v4-production":
        return ("wertsolutions/manusis-v4", file)
    raise Exception("Not handled")


class ProjectStackTraceEndpoint(ProjectEndpoint):
    def get(self, request, project):
        file = request.GET.get("file")
        ref = request.GET.get("commitId") or "master"

        organization = project.organization

        repo, relative_path = get_repo_and_relative_path_from_project(project, file)
        respository = Repository.objects.get(
            organization_id=project.organization_id,
            url__contains=repo,
            provider__startswith="integrations:",
        )
        provider = respository.provider.replace("integrations:", "")

        integration = Integration.objects.filter(
            organizations=organization, status=0, provider=provider
        )[0]

        try:
            if provider == "github":
                client = GitHubAppsClient(integration)
                client.get_file(repo, relative_path)
            elif provider == "gitlab":
                client = GitlabIntegration(integration, organization.id)
                client.get_file(
                    respository.config["project_id"], percent_encode(relative_path), ref
                )
            else:
                raise Exception(u"Unsupported provider: {}".format(provider))

        except ApiError as e:
            if provider == "gitlab":
                # gitlab gives us a 400 on a missing file
                if e.code == 400:
                    return self.respond({"value": False, "relative_path": relative_path})
            # other providers give us a 404
            if e.code != 404:
                raise

            return self.respond({"value": False, "relative_path": relative_path})

        return self.respond({"value": True, "relative_path": relative_path})
