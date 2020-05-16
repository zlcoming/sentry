import {withRouter, WithRouterProps} from 'react-router';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';
import * as Sentry from '@sentry/react';

import {t, tct} from 'sentry/locale';
import ExternalLink from 'sentry/components/links/externalLink';
import {PageContent} from 'sentry/styles/organization';
import LoadingError from 'sentry/components/loadingError';
import getRouteStringFromRoutes from 'sentry/utils/getRouteStringFromRoutes';

const ERROR_NAME = 'Permission Denied';

type Props = WithRouterProps;

class PermissionDenied extends React.Component<Props> {
  static contextTypes = {
    organization: PropTypes.object,
    project: PropTypes.object,
  };

  componentDidMount() {
    const {routes} = this.props;
    const {organization, project} = this.context;

    const route = getRouteStringFromRoutes(routes);
    Sentry.withScope(scope => {
      scope.setFingerprint([ERROR_NAME, route]);
      scope.setExtra('route', route);
      scope.setExtra('orgFeatures', (organization && organization.features) || []);
      scope.setExtra('orgAccess', (organization && organization.access) || []);
      scope.setExtra('projectFeatures', (project && project.features) || []);
      Sentry.captureException(new Error(`${ERROR_NAME}${route ? ` : ${route}` : ''}`));
    });
  }

  render() {
    return (
      <DocumentTitle title={t('Permission Denied')}>
        <PageContent>
          <LoadingError
            message={tct(
              `Your role does not have the necessary permissions to access this
               resource, please read more about [link:organizational roles]`,
              {
                link: <ExternalLink href="https://docs.sentry.io/learn/membership/" />,
              }
            )}
          />
        </PageContent>
      </DocumentTitle>
    );
  }
}

export default withRouter(PermissionDenied);
