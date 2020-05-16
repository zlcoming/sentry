import React from 'react';

import AccountSettingsNavigation from 'sentry/views/settings/account/accountSettingsNavigation';
import {fetchOrganizationDetails} from 'sentry/actionCreators/organizations';
import SentryTypes from 'sentry/sentryTypes';
import SettingsLayout from 'sentry/views/settings/components/settingsLayout';
import withLatestContext from 'sentry/utils/withLatestContext';

class AccountSettingsLayout extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization,
  };

  static childContextTypes = {
    organization: SentryTypes.Organization,
  };

  getChildContext() {
    return {
      organization: this.props.organization,
    };
  }

  componentDidUpdate(prevProps) {
    const {organization} = this.props;
    if (prevProps.organization === organization) {
      return;
    }

    // if there is no org in context, SidebarDropdown uses an org from `withLatestContext`
    // (which queries the org index endpoint instead of org details)
    // and does not have `access` info
    if (organization && typeof organization.access === 'undefined') {
      fetchOrganizationDetails(organization.slug, {
        setActive: true,
        loadProjects: true,
      });
    }
  }

  render() {
    return (
      <SettingsLayout
        {...this.props}
        renderNavigation={() => <AccountSettingsNavigation {...this.props} />}
      >
        {this.props.children}
      </SettingsLayout>
    );
  }
}

export default withLatestContext(AccountSettingsLayout);
