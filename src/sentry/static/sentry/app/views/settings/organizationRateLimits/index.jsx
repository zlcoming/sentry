import React from 'react';
import PropTypes from 'prop-types';

import SentryTypes from 'sentry/sentryTypes';
import withOrganization from 'sentry/utils/withOrganization';

import OrganizationRateLimits from './organizationRateLimits';

class OrganizationRateLimitsContainer extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization,
    routes: PropTypes.array,
  };

  render() {
    if (!this.props.organization) {
      return null;
    }

    return <OrganizationRateLimits {...this.props} />;
  }
}

export default withOrganization(OrganizationRateLimitsContainer);
