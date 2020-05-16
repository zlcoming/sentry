import React from 'react';

import SettingsNavigation from 'sentry/views/settings/components/settingsNavigation';
import navigationConfiguration from 'sentry/views/settings/account/navigationConfiguration';

const AccountSettingsNavigation = () => (
  <SettingsNavigation navigationObjects={navigationConfiguration} />
);

export default AccountSettingsNavigation;
