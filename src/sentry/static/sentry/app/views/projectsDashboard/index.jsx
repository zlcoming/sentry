import {Link} from 'react-router';
import LazyLoad from 'react-lazyload';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import uniq from 'lodash/uniq';
import flatten from 'lodash/flatten';
import {withProfiler} from '@sentry/react';

import {sortProjects} from 'sentry/utils';
import {t} from 'sentry/locale';
import LoadingError from 'sentry/components/loadingError';
import Button from 'sentry/components/button';
import IdBadge from 'sentry/components/idBadge';
import NoProjectMessage from 'sentry/components/noProjectMessage';
import PageHeading from 'sentry/components/pageHeading';
import SentryDocumentTitle from 'sentry/components/sentryDocumentTitle';
import ProjectsStatsStore from 'sentry/stores/projectsStatsStore';
import SentryTypes from 'sentry/sentryTypes';
import space from 'sentry/styles/space';
import LoadingIndicator from 'sentry/components/loadingIndicator';
import withApi from 'sentry/utils/withApi';
import withOrganization from 'sentry/utils/withOrganization';
import withTeamsForUser from 'sentry/utils/withTeamsForUser';
import {IconAdd} from 'sentry/icons';

import Resources from './resources';
import TeamSection from './teamSection';

class Dashboard extends React.Component {
  static propTypes = {
    teams: PropTypes.array,
    organization: SentryTypes.Organization,
    loadingTeams: PropTypes.bool,
    error: PropTypes.instanceOf(Error),
  };

  componentWillUnmount() {
    ProjectsStatsStore.reset();
  }

  render() {
    const {teams, params, organization, loadingTeams, error} = this.props;

    if (loadingTeams) {
      return <LoadingIndicator />;
    }

    if (error) {
      return <LoadingError message="An error occurred while fetching your projects" />;
    }

    const filteredTeams = teams.filter(team => team.projects.length);
    filteredTeams.sort((team1, team2) => team1.slug.localeCompare(team2.slug));

    const projects = uniq(flatten(teams.map(teamObj => teamObj.projects)), 'id');
    const favorites = projects.filter(project => project.isBookmarked);

    const access = new Set(organization.access);
    const canCreateProjects = access.has('project:admin');
    const hasTeamAdminAccess = access.has('team:admin');

    const showEmptyMessage = projects.length === 0 && favorites.length === 0;
    const showResources = projects.length === 1 && !projects[0].firstEvent;

    if (showEmptyMessage) {
      return (
        <NoProjectMessage organization={organization} projects={projects}>
          {null}
        </NoProjectMessage>
      );
    }
    return (
      <React.Fragment>
        <SentryDocumentTitle
          title={t('Projects Dashboard')}
          objSlug={organization.slug}
        />
        {projects.length > 0 && (
          <ProjectsHeader>
            <PageHeading>Projects</PageHeading>
            <Button
              size="small"
              disabled={!canCreateProjects}
              title={
                !canCreateProjects
                  ? t('You do not have permission to create projects')
                  : undefined
              }
              to={`/organizations/${organization.slug}/projects/new/`}
              icon={<IconAdd size="xs" isCircled />}
              data-test-id="create-project"
            >
              {t('Create Project')}
            </Button>
          </ProjectsHeader>
        )}

        {filteredTeams.map((team, index) => {
          const showBorder = index !== teams.length - 1;
          return (
            <LazyLoad key={team.slug} once debounce={50} height={300} offset={300}>
              <TeamSection
                orgId={params.orgId}
                team={team}
                showBorder={showBorder}
                title={
                  hasTeamAdminAccess ? (
                    <TeamLink to={`/settings/${organization.slug}/teams/${team.slug}/`}>
                      <IdBadge team={team} avatarSize={22} />
                    </TeamLink>
                  ) : (
                    <IdBadge team={team} avatarSize={22} />
                  )
                }
                projects={sortProjects(team.projects)}
                access={access}
              />
            </LazyLoad>
          );
        })}

        {showResources && <Resources />}
      </React.Fragment>
    );
  }
}

const OrganizationDashboard = props => (
  <OrganizationDashboardWrapper>
    <Dashboard {...props} />
  </OrganizationDashboardWrapper>
);

const TeamLink = styled(Link)`
  display: flex;
  align-items: center;
`;

const ProjectsHeader = styled('div')`
  padding: ${space(3)} ${space(4)} 0 ${space(4)};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const OrganizationDashboardWrapper = styled('div')`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

export {Dashboard};
export default withApi(
  withOrganization(withTeamsForUser(withProfiler(OrganizationDashboard)))
);
