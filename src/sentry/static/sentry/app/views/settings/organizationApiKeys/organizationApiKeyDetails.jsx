import {browserHistory} from 'react-router';
import React from 'react';
import styled from '@emotion/styled';

import {API_ACCESS_SCOPES} from 'sentry/constants';
import {addErrorMessage, addSuccessMessage} from 'sentry/actionCreators/indicator';
import {t} from 'sentry/locale';
import space from 'sentry/styles/space';
import ApiForm from 'sentry/components/forms/apiForm';
import MultipleCheckboxField from 'sentry/components/forms/multipleCheckboxField';
import AsyncView from 'sentry/views/asyncView';
import SentryTypes from 'sentry/sentryTypes';
import TextField from 'sentry/components/forms/textField';
import TextareaField from 'sentry/components/forms/textareaField';
import recreateRoute from 'sentry/utils/recreateRoute';

const API_CHOICES = API_ACCESS_SCOPES.map(s => [s, s]);

class OrganizationApiKeyDetails extends AsyncView {
  static contextTypes = {
    organization: SentryTypes.Organization,
  };

  getDefaultState() {
    return {
      loading: true,
      error: false,
      apiKey: {},
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.location.search !== this.props.location.search ||
      nextProps.params.orgId !== this.props.params.orgId
    ) {
      this.remountComponent();
    }
  }

  getEndpoints() {
    return [
      [
        'apiKey',
        `/organizations/${this.props.params.orgId}/api-keys/${this.props.params.apiKey}/`,
      ],
    ];
  }

  getTitle() {
    const org = this.context.organization;
    return `${org.name} Edit API Key`;
  }

  handleSubmitSuccess = () => {
    addSuccessMessage('Saved changes');

    // Go back to API list
    browserHistory.push(
      recreateRoute('', {
        stepBack: -1,
        routes: this.props.routes,
        params: this.props.params,
      })
    );
  };

  handleSubmitError = () => {
    addErrorMessage('Unable to save changes. Please try again.');
  };

  renderBody() {
    return (
      <div>
        <div className="page-header">
          <h3>{t('Edit Api Key')}</h3>
        </div>

        <ApiForm
          apiMethod="PUT"
          apiEndpoint={`/organizations/${this.props.params.orgId}/api-keys/${this.props.params.apiKey}/`}
          initialData={this.state.apiKey}
          onSubmitSuccess={this.handleSubmitSuccess}
          onSubmitError={this.handleSubmitError}
          onCancel={() =>
            browserHistory.push(
              recreateRoute('', {
                stepBack: -1,
                routes: this.props.routes,
                params: this.props.params,
              })
            )
          }
        >
          <SplitInput>
            <TextField label={t('Label')} name="label" />
            <TextField label={t('API Key')} name="key" disabled />
          </SplitInput>

          <MultipleCheckboxField
            name="scope_list"
            label={t('Scopes')}
            required
            choices={API_CHOICES}
          />

          <TextareaField
            label={t('Allowed Domains')}
            name="allowed_origins"
            placeholder="e.g. example.com or https://example.com"
            help="Separate multiple entries with a newline"
          />
        </ApiForm>
      </div>
    );
  }
}

const SplitInput = styled('div')`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: ${space(2)};
`;

export default OrganizationApiKeyDetails;
