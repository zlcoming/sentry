import {Link} from 'react-router';
import React from 'react';

import {t} from 'sentry/locale';
import GroupTombstones from 'sentry/views/settings/project/projectFilters/groupTombstones';
import NavTabs from 'sentry/components/navTabs';
import SentryDocumentTitle from 'sentry/components/sentryDocumentTitle';
import PermissionAlert from 'sentry/views/settings/project/permissionAlert';
import ProjectFiltersChart from 'sentry/views/settings/project/projectFilters/projectFiltersChart';
import ProjectFiltersSettings from 'sentry/views/settings/project/projectFilters/projectFiltersSettings';
import SentryTypes from 'sentry/sentryTypes';
import SettingsPageHeader from 'sentry/views/settings/components/settingsPageHeader';
import TextBlock from 'sentry/views/settings/components/text/textBlock';
import recreateRoute from 'sentry/utils/recreateRoute';
import withProject from 'sentry/utils/withProject';

class ProjectFilters extends React.Component {
  static propTypes = {
    project: SentryTypes.Project,
  };

  render() {
    const {project, params} = this.props;
    const {orgId, projectId, filterType} = params;
    if (!project) {
      return null;
    }

    const features = new Set(project.features);

    return (
      <div>
        <SentryDocumentTitle title={t('Inbound Filters')} objSlug={projectId} />
        <SettingsPageHeader title={t('Inbound Data Filters')} />
        <PermissionAlert />

        <TextBlock>
          {t(
            'Filters allow you to prevent Sentry from storing events in certain situations. Filtered events are tracked separately from rate limits, and do not apply to any project quotas.'
          )}
        </TextBlock>

        <div>
          <ProjectFiltersChart project={project} params={this.props.params} />

          {features.has('discard-groups') && (
            <NavTabs underlined style={{paddingTop: '30px'}}>
              <li className={filterType === 'data-filters' ? 'active' : ''}>
                <Link to={recreateRoute('data-filters/', {...this.props, stepBack: -1})}>
                  {t('Data Filters')}
                </Link>
              </li>
              <li className={filterType === 'discarded-groups' ? 'active' : ''}>
                <Link
                  to={recreateRoute('discarded-groups/', {...this.props, stepBack: -1})}
                >
                  {t('Discarded Issues')}
                </Link>
              </li>
            </NavTabs>
          )}

          {filterType === 'discarded-groups' ? (
            <GroupTombstones orgId={orgId} projectId={project.slug} />
          ) : (
            <ProjectFiltersSettings
              project={project}
              params={this.props.params}
              features={features}
            />
          )}
        </div>
      </div>
    );
  }
}

export default withProject(ProjectFilters);
