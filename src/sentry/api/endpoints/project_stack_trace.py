from __future__ import absolute_import


from sentry.api.bases.project import ProjectEndpoint
from sentry.models import Integration
from sentry.integrations.github.client import GitHubAppsClient


def get_repo_and_relative_path_from_project(project, file):
    # organization = project.organization
    if project.slug == "react":
        return (
            "scefali/sentry-demo-react",
            file.replace("/Users/scefali/Work/sentry-demo-react/", ""),
        )
    if project.slug == "xc-prod":
        return ("picmonkey/picmonkey", file.replace("./src", "xc/src"))
    raise Exception("Not handled")


class GithubRawCodeClient(GitHubAppsClient):
    # base_url = "https://raw.githubusercontent.com"

    def get_file(self, repo, file):
        url = u"/repos/{}/contents/{}".format(repo, file)
        # TODO: convert to head request
        return self.get(url)


class ProjectStackTraceEndpoint(ProjectEndpoint):
    def get(self, request, project):
        file = request.GET.get("file")
        organization = project.organization
        github = Integration.objects.filter(
            organizations=organization, status=0, provider="github"
        )[0]
        client = GithubRawCodeClient(github)

        repo, relative_path = get_repo_and_relative_path_from_project(project, file)
        client.get_file(repo, relative_path)
        return self.respond(status=204)
