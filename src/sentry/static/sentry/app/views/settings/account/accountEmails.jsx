import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

import {Panel, PanelBody, PanelHeader, PanelItem} from 'sentry/components/panels';
import {addErrorMessage} from 'sentry/actionCreators/indicator';
import {t} from 'sentry/locale';
import AlertLink from 'sentry/components/alertLink';
import AsyncView from 'sentry/views/asyncView';
import Button from 'sentry/components/button';
import {IconDelete, IconStack} from 'sentry/icons';
import Form from 'sentry/views/settings/components/forms/form';
import JsonForm from 'sentry/views/settings/components/forms/jsonForm';
import SettingsPageHeader from 'sentry/views/settings/components/settingsPageHeader';
import Tag from 'sentry/views/settings/components/tag';
import accountEmailsFields from 'sentry/data/forms/accountEmails';
import space from 'sentry/styles/space';
import ButtonBar from 'sentry/components/buttonBar';

const ENDPOINT = '/users/me/emails/';

class EmailRow extends React.Component {
  static propTypes = {
    email: PropTypes.string.isRequired,
    onRemove: PropTypes.func.isRequired,
    onVerify: PropTypes.func.isRequired,
    isVerified: PropTypes.bool,
    isPrimary: PropTypes.bool,
    hideRemove: PropTypes.bool,
    onSetPrimary: PropTypes.func,
  };

  handleSetPrimary = e => {
    if (typeof this.props.onSetPrimary === 'function') {
      this.props.onSetPrimary(this.props.email, e);
    }
  };

  handleRemove = e => {
    this.props.onRemove(this.props.email, e);
  };

  handleVerify = e => {
    this.props.onVerify(this.props.email, e);
  };

  render() {
    const {email, isPrimary, isVerified, hideRemove} = this.props;

    return (
      <EmailItem>
        <EmailTags>
          {email}
          {!isVerified && <Tag priority="warning">{t('Unverified')}</Tag>}
          {isPrimary && <Tag priority="success">{t('Primary')}</Tag>}
        </EmailTags>
        <ButtonBar gap={1}>
          {!isPrimary && isVerified && (
            <Button size="small" onClick={this.handleSetPrimary}>
              {t('Set as primary')}
            </Button>
          )}
          {!isVerified && (
            <Button size="small" onClick={this.handleVerify}>
              {t('Resend verification')}
            </Button>
          )}
          {!hideRemove && !isPrimary && (
            <Button
              data-test-id="remove"
              priority="danger"
              size="small"
              icon={<IconDelete />}
              onClick={this.handleRemove}
            />
          )}
        </ButtonBar>
      </EmailItem>
    );
  }
}

class AccountEmails extends AsyncView {
  getEndpoints() {
    return [['emails', ENDPOINT]];
  }

  getTitle() {
    return 'Emails';
  }

  handleSubmitSuccess = (_change, model, id) => {
    model.setValue(id, '');
    this.remountComponent();
  };

  handleError = err => {
    this.remountComponent();

    if (err && err.responseJSON && err.responseJSON.email) {
      addErrorMessage(err.responseJSON.email);
    }
  };

  createApiCall = (endpoint, requestParams) => {
    this.setState({loading: true, emails: []}, () => {
      this.api
        .requestPromise(endpoint, requestParams)
        .then(this.remountComponent.bind(this))
        .catch(this.handleError);
    });
  };

  handleSetPrimary = email => {
    this.createApiCall(ENDPOINT, {
      method: 'PUT',
      data: {
        email,
      },
    });
  };

  handleRemove = email => {
    this.createApiCall(ENDPOINT, {
      method: 'DELETE',
      data: {
        email,
      },
    });
  };

  handleVerify = email => {
    this.createApiCall(`${ENDPOINT}confirm/`, {
      method: 'POST',
      data: {
        email,
      },
    });
  };

  renderBody() {
    const {emails} = this.state;
    const primary = emails.find(({isPrimary}) => isPrimary);
    const secondary = emails.filter(({isPrimary}) => !isPrimary);

    return (
      <div>
        <SettingsPageHeader title="Emails" />

        <Panel>
          <PanelHeader>{t('Emails')}</PanelHeader>
          <PanelBody>
            {primary && (
              <EmailRow
                onRemove={this.handleRemove}
                onVerify={this.handleVerify}
                {...primary}
              />
            )}

            {secondary &&
              secondary.map(emailObj => (
                <EmailRow
                  key={emailObj.email}
                  onSetPrimary={this.handleSetPrimary}
                  onRemove={this.handleRemove}
                  onVerify={this.handleVerify}
                  {...emailObj}
                />
              ))}
          </PanelBody>
        </Panel>

        <Form
          apiMethod="POST"
          apiEndpoint={ENDPOINT}
          saveOnBlur
          allowUndo={false}
          onSubmitSuccess={this.handleSubmitSuccess}
        >
          <JsonForm location={this.props.location} forms={accountEmailsFields} />
        </Form>

        <AlertLink to="/settings/account/notifications" icon={<IconStack />}>
          {t('Want to change how many emails you get? Use the notifications panel.')}
        </AlertLink>
      </div>
    );
  }
}

export default AccountEmails;

const EmailTags = styled('div')`
  display: grid;
  grid-auto-flow: column;
  grid-gap: ${space(1)};
  align-items: center;
`;

const EmailItem = styled(PanelItem)`
  justify-content: space-between;
`;
