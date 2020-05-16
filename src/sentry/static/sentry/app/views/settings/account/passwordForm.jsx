import React from 'react';

import {addErrorMessage, addSuccessMessage} from 'sentry/actionCreators/indicator';
import {t} from 'sentry/locale';
import Form from 'sentry/views/settings/components/forms/form';
import Button from 'sentry/components/button';
import ConfigStore from 'sentry/stores/configStore';
import JsonForm from 'sentry/views/settings/components/forms/jsonForm';
import {PanelAlert, PanelItem} from 'sentry/components/panels';
import accountPasswordFields from 'sentry/data/forms/accountPassword';

const ENDPOINT = '/users/me/password/';

class PasswordForm extends React.Component {
  handleSubmitSuccess = (_change, model) => {
    // Reset form on success
    model.resetForm();
    addSuccessMessage('Password has been changed');
  };

  handleSubmitError = () => {
    addErrorMessage('Error changing password');
  };

  render() {
    const user = ConfigStore.get('user');
    return (
      <Form
        apiMethod="PUT"
        apiEndpoint={ENDPOINT}
        initialData={{}}
        onSubmitSuccess={this.handleSubmitSuccess}
        onSubmitError={this.handleSubmitError}
        hideFooter
      >
        <JsonForm
          location={this.props.location}
          forms={accountPasswordFields}
          additionalFieldProps={{user}}
          renderFooter={() => (
            <PanelItem justifyContent="flex-end">
              <Button type="submit" priority="primary">
                {t('Change password')}
              </Button>
            </PanelItem>
          )}
          renderHeader={() => (
            <PanelAlert type="info">
              {t('Changing your password will invalidate all logged in sessions.')}
            </PanelAlert>
          )}
        />
      </Form>
    );
  }
}

export default PasswordForm;
