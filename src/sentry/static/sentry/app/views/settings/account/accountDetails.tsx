import React from 'react';

import AsyncView from 'sentry/views/asyncView';
import AvatarChooser from 'sentry/components/avatarChooser';
import Form from 'sentry/views/settings/components/forms/form';
import JsonForm from 'sentry/views/settings/components/forms/jsonForm';
import SettingsPageHeader from 'sentry/views/settings/components/settingsPageHeader';
import accountDetailsFields from 'sentry/data/forms/accountDetails';
import accountPreferencesFields from 'sentry/data/forms/accountPreferences';
import {APIRequestMethod} from 'sentry/api';
import {updateUser} from 'sentry/actionCreators/account';
import {t} from 'sentry/locale';
import {User} from 'sentry/types';

const ENDPOINT = '/users/me/';

class AccountDetails extends AsyncView {
  getEndpoints(): ReturnType<AsyncView['getEndpoints']> {
    // local state is NOT updated when the form saves
    return [['user', ENDPOINT]];
  }

  handleSubmitSuccess = (user: User) => {
    // the updateUser method updates our Config Store
    // No components listen to the ConfigStore, they just access it directly
    updateUser(user);
    // We need to update the state, because AvatarChooser is using it,
    // otherwise it will flick
    this.setState({
      user,
    });
  };

  renderBody() {
    const user = this.state.user as User;
    const {location} = this.props;

    const formCommonProps: Partial<Form['props']> = {
      apiEndpoint: ENDPOINT,
      apiMethod: 'PUT' as APIRequestMethod,
      allowUndo: true,
      saveOnBlur: true,
    };

    return (
      <div>
        <SettingsPageHeader title={t('Account Details')} />
        <Form
          initialData={user}
          {...formCommonProps}
          onSubmitSuccess={this.handleSubmitSuccess}
        >
          <JsonForm
            location={location}
            forms={accountDetailsFields}
            additionalFieldProps={{user}}
          />
        </Form>
        <Form initialData={user.options} {...formCommonProps} allowUndo>
          <JsonForm location={location} forms={accountPreferencesFields} />
        </Form>
        <AvatarChooser
          endpoint="/users/me/avatar/"
          model={user}
          onSave={resp => {
            this.handleSubmitSuccess(resp as User);
          }}
          isUser
        />
      </div>
    );
  }
}

export default AccountDetails;
