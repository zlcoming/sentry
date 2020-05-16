import React from 'react';
import {RouteComponentProps} from 'react-router/lib/Router';

import {t, tct} from 'sentry/locale';
import ReleaseArtifactsV1 from 'sentry/views/releases/detail/releaseArtifacts';
import AsyncView from 'sentry/views/asyncView';
import routeTitleGen from 'sentry/utils/routeTitle';
import {formatVersion} from 'sentry/utils/formatters';
import withOrganization from 'sentry/utils/withOrganization';
import {Organization} from 'sentry/types';
import AlertLink from 'sentry/components/alertLink';
import Feature from 'sentry/components/acl/feature';
import {Main} from 'sentry/components/layouts/thirds';

import {ReleaseContext} from '..';

type RouteParams = {
  orgId: string;
  release: string;
};

type Props = RouteComponentProps<RouteParams, {}> & {
  organization: Organization;
};

class ReleaseArtifacts extends AsyncView<Props> {
  static contextType = ReleaseContext;

  getTitle() {
    const {params, organization} = this.props;
    return routeTitleGen(
      t('Artifacts - Release %s', formatVersion(params.release)),
      organization.slug,
      false
    );
  }

  renderBody() {
    const {project} = this.context;
    const {params, location, organization} = this.props;

    return (
      <Main fullWidth>
        <Feature features={['artifacts-in-settings']}>
          {({hasFeature}) =>
            hasFeature ? (
              <AlertLink
                to={`/settings/${organization.slug}/projects/${
                  project.slug
                }/source-maps/${encodeURIComponent(params.release)}/`}
                priority="info"
              >
                {tct('Artifacts were moved to [sourceMaps] in Settings.', {
                  sourceMaps: <u>{t('Source Maps')}</u>,
                })}
              </AlertLink>
            ) : (
              <ReleaseArtifactsV1
                params={params}
                location={location}
                projectId={project.slug}
                smallEmptyMessage
              />
            )
          }
        </Feature>
      </Main>
    );
  }
}

export default withOrganization(ReleaseArtifacts);
