import React from 'react';

import Feature from 'sentry/components/acl/feature';
import FeatureDisabled from 'sentry/components/acl/featureDisabled';
import {PanelAlert} from 'sentry/components/panels';
import {t} from 'sentry/locale';
import withOrganization from 'sentry/utils/withOrganization';

import Relays from './relays';

const OrganizationRelays = ({organization, ...props}: Relays['props']) => (
  <Feature
    features={['relay']}
    organization={organization}
    renderDisabled={() => (
      <FeatureDisabled
        alert={PanelAlert}
        features={organization.features}
        featureName={t('Relays')}
      />
    )}
  >
    <Relays organization={organization} {...props} />
  </Feature>
);

export default withOrganization(OrganizationRelays);
