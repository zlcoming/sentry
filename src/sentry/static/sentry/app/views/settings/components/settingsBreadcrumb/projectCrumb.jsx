import {browserHistory} from 'react-router';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

import BreadcrumbDropdown from 'sentry/views/settings/components/settingsBreadcrumb/breadcrumbDropdown';
import IdBadge from 'sentry/components/idBadge';
import LoadingIndicator from 'sentry/components/loadingIndicator';
import MenuItem from 'sentry/views/settings/components/settingsBreadcrumb/menuItem';
import SentryTypes from 'sentry/sentryTypes';
import findFirstRouteWithoutRouteParam from 'sentry/views/settings/components/settingsBreadcrumb/findFirstRouteWithoutRouteParam';
import recreateRoute from 'sentry/utils/recreateRoute';
import replaceRouterParams from 'sentry/utils/replaceRouterParams';
import space from 'sentry/styles/space';
import withLatestContext from 'sentry/utils/withLatestContext';
import withProjects from 'sentry/utils/withProjects';

import {CrumbLink} from '.';

class ProjectCrumb extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization,
    project: SentryTypes.Project,
    projects: PropTypes.array,
    routes: PropTypes.array,
    route: PropTypes.object,
  };

  handleSelect = item => {
    const {routes, route, params} = this.props;

    // We have to make exceptions for routes like "Project Alerts Rule Edit" or "Client Key Details"
    // Since these models are project specific, we need to traverse up a route when switching projects
    //
    // we manipulate `routes` so that it doesn't include the current project's route
    // which, unlike the org version, does not start with a route param
    browserHistory.push(
      recreateRoute(
        findFirstRouteWithoutRouteParam(routes.slice(routes.indexOf(route) + 1), route),
        {
          routes,
          params: {...params, projectId: item.value},
        }
      )
    );
  };

  render() {
    const {
      organization: latestOrganization,
      project: latestProject,
      projects,
      route,
      ...props
    } = this.props;

    if (!latestOrganization) {
      return null;
    }
    if (!projects) {
      return null;
    }

    const hasMenu = projects && projects.length > 1;

    return (
      <BreadcrumbDropdown
        hasMenu={hasMenu}
        route={route}
        name={
          <ProjectName>
            {!latestProject ? (
              <LoadingIndicator mini />
            ) : (
              <CrumbLink
                to={replaceRouterParams('/settings/:orgId/projects/:projectId/', {
                  orgId: latestOrganization.slug,
                  projectId: latestProject.slug,
                })}
              >
                <IdBadge project={latestProject} avatarSize={18} />
              </CrumbLink>
            )}
          </ProjectName>
        }
        onSelect={this.handleSelect}
        items={projects.map(project => ({
          value: project.slug,
          label: (
            <MenuItem>
              <IdBadge
                project={project}
                avatarProps={{consistentWidth: true}}
                avatarSize={18}
              />
            </MenuItem>
          ),
        }))}
        {...props}
      />
    );
  }
}

export {ProjectCrumb};
export default withProjects(withLatestContext(ProjectCrumb));

// Set height of crumb because of spinner
const SPINNER_SIZE = '24px';

const ProjectName = styled('div')`
  display: flex;

  .loading {
    width: ${SPINNER_SIZE};
    height: ${SPINNER_SIZE};
    margin: 0 ${space(0.25)} 0 0;
  }
`;
