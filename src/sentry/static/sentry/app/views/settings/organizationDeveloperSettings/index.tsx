import React from 'react';
import {RouteComponentProps} from 'react-router/lib/Router';

import AlertLink from 'sentry/components/alertLink';
import AsyncView from 'sentry/views/asyncView';
import Button from 'sentry/components/button';
import EmptyMessage from 'sentry/views/settings/components/emptyMessage';
import {Panel, PanelBody, PanelHeader} from 'sentry/components/panels';
import {IconAdd} from 'sentry/icons';
import {removeSentryApp} from 'sentry/actionCreators/sentryApps';
import SentryTypes from 'sentry/sentryTypes';
import SettingsPageHeader from 'sentry/views/settings/components/settingsPageHeader';
import SentryApplicationRow from 'sentry/views/settings/organizationDeveloperSettings/sentryApplicationRow';
import withOrganization from 'sentry/utils/withOrganization';
import {t} from 'sentry/locale';
import routeTitleGen from 'sentry/utils/routeTitle';
import {Organization, SentryApp} from 'sentry/types';

type Props = Omit<AsyncView['props'], 'params'> & {
  organization: Organization;
} & RouteComponentProps<{orgId: string}, {}>;

type State = AsyncView['state'] & {
  applications: SentryApp[];
};

class OrganizationDeveloperSettings extends AsyncView<Props, State> {
  static propTypes = {
    organization: SentryTypes.Organization.isRequired,
  };

  getTitle() {
    const {orgId} = this.props.params;
    return routeTitleGen(t('Developer Settings'), orgId, false);
  }

  getEndpoints(): [string, string][] {
    const {orgId} = this.props.params;

    return [['applications', `/organizations/${orgId}/sentry-apps/`]];
  }

  removeApp = (app: SentryApp) => {
    const apps = this.state.applications.filter(a => a.slug !== app.slug);
    removeSentryApp(this.api, app).then(
      () => {
        this.setState({applications: apps});
      },
      () => {}
    );
  };

  renderApplicationRow = (app: SentryApp) => {
    const {organization} = this.props;
    return (
      <SentryApplicationRow
        key={app.uuid}
        app={app}
        organization={organization}
        onRemoveApp={this.removeApp}
      />
    );
  };

  renderInternalIntegrations() {
    const {orgId} = this.props.params;
    const integrations = this.state.applications.filter(
      (app: SentryApp) => app.status === 'internal'
    );
    const isEmpty = integrations.length === 0;

    const action = (
      <Button
        priority="primary"
        size="small"
        to={`/settings/${orgId}/developer-settings/new-internal/`}
        icon={<IconAdd size="xs" isCircled />}
      >
        {t('New Internal Integration')}
      </Button>
    );

    return (
      <Panel>
        <PanelHeader hasButtons>
          {t('Internal Integrations')}
          {action}
        </PanelHeader>
        <PanelBody>
          {!isEmpty ? (
            integrations.map(this.renderApplicationRow)
          ) : (
            <EmptyMessage>
              {t('No internal integrations have been created yet.')}
            </EmptyMessage>
          )}
        </PanelBody>
      </Panel>
    );
  }

  renderExernalIntegrations() {
    const {orgId} = this.props.params;
    const integrations = this.state.applications.filter(app => app.status !== 'internal');
    const isEmpty = integrations.length === 0;

    const action = (
      <Button
        priority="primary"
        size="small"
        to={`/settings/${orgId}/developer-settings/new-public/`}
        icon={<IconAdd size="xs" isCircled />}
      >
        {t('New Public Integration')}
      </Button>
    );

    return (
      <Panel>
        <PanelHeader hasButtons>
          {t('Public Integrations')}
          {action}
        </PanelHeader>
        <PanelBody>
          {!isEmpty ? (
            integrations.map(this.renderApplicationRow)
          ) : (
            <EmptyMessage>
              {t('No public integrations have been created yet.')}
            </EmptyMessage>
          )}
        </PanelBody>
      </Panel>
    );
  }

  renderBody() {
    return (
      <div>
        <SettingsPageHeader title={t('Developer Settings')} />
        <AlertLink href="https://docs.sentry.io/workflow/integrations/integration-platform/">
          {t(
            'Have questions about the Integration Platform? Learn more about it in our docs.'
          )}
        </AlertLink>
        {this.renderExernalIntegrations()}
        {this.renderInternalIntegrations()}
      </div>
    );
  }
}

export default withOrganization(OrganizationDeveloperSettings);
