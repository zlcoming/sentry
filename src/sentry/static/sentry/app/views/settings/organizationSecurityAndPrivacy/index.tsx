import React from 'react';
import {RouteComponentProps} from 'react-router/lib/Router';

import {t} from 'sentry/locale';
import SettingsPageHeader from 'sentry/views/settings/components/settingsPageHeader';
import JsonForm from 'sentry/views/settings/components/forms/jsonForm';
import Form from 'sentry/views/settings/components/forms/form';
import AsyncView from 'sentry/views/asyncView';
import {Organization} from 'sentry/types';
import {addErrorMessage} from 'sentry/actionCreators/indicator';
import {updateOrganization} from 'sentry/actionCreators/organizations';
import organizationSecurityAndPrivacy from 'sentry/data/forms/organizationSecurityAndPrivacy';
import withOrganization from 'sentry/utils/withOrganization';
import SentryDocumentTitle from 'sentry/components/sentryDocumentTitle';

import DataScrubbing from '../components/dataScrubbing';

type Props = RouteComponentProps<{orgId: string; projectId: string}, {}> & {
  organization: Organization;
};

class OrganizationSecurityAndPrivacyContent extends AsyncView<Props> {
  getEndpoints(): ReturnType<AsyncView['getEndpoints']> {
    const {orgId} = this.props.params;
    return [['authProvider', `/organizations/${orgId}/auth-provider/`]];
  }

  handleUpdateOrganization = (data: Organization) => {
    // This will update OrganizationStore (as well as OrganizationsStore
    // which is slightly incorrect because it has summaries vs a detailed org)
    updateOrganization(data);
  };

  renderBody() {
    const {organization} = this.props;
    const {orgId} = this.props.params;
    const initialData = organization;
    const endpoint = `/organizations/${orgId}/`;
    const access = new Set(organization.access);
    const features = new Set(organization.features);
    const relayPiiConfig = organization.relayPiiConfig;
    const {authProvider} = this.state;
    const title = t('Security & Privacy');

    return (
      <React.Fragment>
        <SentryDocumentTitle title={title} objSlug={organization.slug} />
        <SettingsPageHeader title={title} />
        <Form
          data-test-id="organization-settings-security-and-privacy"
          apiMethod="PUT"
          apiEndpoint={endpoint}
          initialData={initialData}
          additionalFieldProps={{hasSsoEnabled: !!authProvider}}
          onSubmitSuccess={this.handleUpdateOrganization}
          onSubmitError={() => addErrorMessage(t('Unable to save change'))}
          saveOnBlur
          allowUndo
        >
          <JsonForm
            features={features}
            forms={organizationSecurityAndPrivacy}
            disabled={!access.has('org:write')}
          />
        </Form>
        <DataScrubbing
          additionalContext={t('These rules can be configured for each project.')}
          endpoint={endpoint}
          relayPiiConfig={relayPiiConfig}
          disabled={!access.has('org:write')}
          organization={organization}
          onSubmitSuccess={this.handleUpdateOrganization}
        />
      </React.Fragment>
    );
  }
}

export default withOrganization(OrganizationSecurityAndPrivacyContent);
