import React from 'react';
import {RouteComponentProps} from 'react-router/lib/Router';

import {t} from 'sentry/locale';
import AsyncView from 'sentry/views/asyncView';
import AddIntegration from 'sentry/views/organizationIntegrations/addIntegration';
import BreadcrumbTitle from 'sentry/views/settings/components/settingsBreadcrumb/breadcrumbTitle';
import Button from 'sentry/components/button';
import {IconAdd} from 'sentry/icons';
import Form from 'sentry/views/settings/components/forms/form';
import IntegrationAlertRules from 'sentry/views/organizationIntegrations/integrationAlertRules';
import IntegrationItem from 'sentry/views/organizationIntegrations/integrationItem';
import IntegrationRepos from 'sentry/views/organizationIntegrations/integrationRepos';
import JsonForm from 'sentry/views/settings/components/forms/jsonForm';
import SettingsPageHeader from 'sentry/views/settings/components/settingsPageHeader';
import withOrganization from 'sentry/utils/withOrganization';
import {Organization, Integration, IntegrationProvider} from 'sentry/types';
import {trackIntegrationEvent} from 'sentry/utils/integrationUtil';

type RouteParams = {
  orgId: string;
  integrationId: string;
};
type Props = RouteComponentProps<RouteParams, {}> & {
  organization: Organization;
};
type State = AsyncView['state'] & {
  config: {providers: IntegrationProvider[]};
  integration: Integration;
};
class ConfigureIntegration extends AsyncView<Props, State> {
  getEndpoints(): [string, string][] {
    const {orgId, integrationId} = this.props.params;

    return [
      ['config', `/organizations/${orgId}/config/integrations/`],
      ['integration', `/organizations/${orgId}/integrations/${integrationId}/`],
    ];
  }

  onRequestSuccess({stateKey, data}) {
    if (stateKey !== 'integration') {
      return;
    }
    trackIntegrationEvent(
      {
        eventKey: 'integrations.details_viewed',
        eventName: 'Integrations: Details Viewed',
        integration: data.provider.key,
        integration_type: 'first_party',
      },
      this.props.organization
    );
  }

  getTitle() {
    return this.state.integration
      ? this.state.integration.provider.name
      : 'Configure Integration';
  }

  onUpdateIntegration = () => {
    this.setState(this.getDefaultState(), this.fetchData);
  };

  getAction = (provider: IntegrationProvider | undefined) => {
    const {integration} = this.state;
    const action =
      provider && provider.key === 'pagerduty' ? (
        <AddIntegration
          provider={provider}
          onInstall={this.onUpdateIntegration}
          account={integration.domainName}
        >
          {onClick => (
            <Button
              priority="primary"
              size="small"
              icon={<IconAdd size="xs" isCircled />}
              onClick={() => onClick()}
            >
              {t('Add Services')}
            </Button>
          )}
        </AddIntegration>
      ) : null;

    return action;
  };

  renderBody() {
    const {orgId} = this.props.params;
    const {integration} = this.state;
    const provider = this.state.config.providers.find(
      p => p.key === integration.provider.key
    );

    const title = <IntegrationItem integration={integration} />;

    return (
      <React.Fragment>
        <BreadcrumbTitle routes={this.props.routes} title={integration.provider.name} />
        <SettingsPageHeader
          noTitleStyles
          title={title}
          action={this.getAction(provider)}
        />

        {integration.configOrganization.length > 0 && (
          <Form
            hideFooter
            saveOnBlur
            allowUndo
            apiMethod="POST"
            initialData={integration.configData}
            apiEndpoint={`/organizations/${orgId}/integrations/${integration.id}/`}
          >
            <JsonForm
              fields={integration.configOrganization}
              title={
                integration.provider.aspects.configure_integration?.title ||
                t('Organization Integration Settings')
              }
            />
          </Form>
        )}

        {provider && provider.features.includes('alert-rule') && (
          <IntegrationAlertRules integration={integration} />
        )}

        {provider && provider.features.includes('commits') && (
          <IntegrationRepos {...this.props} integration={integration} />
        )}
      </React.Fragment>
    );
  }
}

export default withOrganization(ConfigureIntegration);
