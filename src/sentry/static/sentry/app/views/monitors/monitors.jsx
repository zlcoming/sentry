import {Link, withRouter} from 'react-router';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

import {PageHeader} from 'sentry/styles/organization';
import {Panel, PanelBody, PanelItem} from 'sentry/components/panels';
import {getParams} from 'sentry/components/organizations/globalSelectionHeader/getParams';
import {t} from 'sentry/locale';
import AsyncView from 'sentry/views/asyncView';
import FeatureBadge from 'sentry/components/featureBadge';
import Button from 'sentry/components/button';
import PageHeading from 'sentry/components/pageHeading';
import Pagination from 'sentry/components/pagination';
import SearchBar from 'sentry/components/searchBar';
import SentryTypes from 'sentry/sentryTypes';
import TimeSince from 'sentry/components/timeSince';
import space from 'sentry/styles/space';
import withOrganization from 'sentry/utils/withOrganization';

import MonitorIcon from './monitorIcon';

class Monitors extends AsyncView {
  static propTypes = {
    organization: SentryTypes.Organization,
    location: PropTypes.object.isRequired,
  };

  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  getEndpoints() {
    const {params, location} = this.props;
    return [
      [
        'monitorList',
        `/organizations/${params.orgId}/monitors/`,
        {
          query: location.query,
        },
      ],
    ];
  }

  getTitle() {
    return `Monitors - ${this.props.params.orgId}`;
  }

  handleSearch = query => {
    const {location} = this.props;
    const {router} = this.context;
    router.push({
      pathname: location.pathname,
      query: getParams({
        ...(location.query || {}),
        query,
      }),
    });
  };

  renderBody() {
    const {monitorListPageLinks} = this.state;
    const {organization} = this.props;
    return (
      <React.Fragment>
        <PageHeader>
          <HeaderTitle>
            <div>
              {t('Monitors')} <FeatureBadge type="beta" />
            </div>
            <NewMonitorButton
              to={`/organizations/${organization.slug}/monitors/create/`}
              priority="primary"
              size="xsmall"
            >
              {t('New Monitor')}
            </NewMonitorButton>
          </HeaderTitle>
          <StyledSearchBar
            organization={organization}
            query={(location.query && location.query.query) || ''}
            placeholder={t('Search for monitors.')}
            onSearch={this.handleSearch}
          />
        </PageHeader>
        <Panel>
          <PanelBody>
            {this.state.monitorList.map(monitor => (
              <PanelItemCentered key={monitor.id}>
                <MonitorIcon status={monitor.status} size={16} />
                <StyledLink
                  to={`/organizations/${organization.slug}/monitors/${monitor.id}/`}
                >
                  {monitor.name}
                </StyledLink>
                {monitor.nextCheckIn ? (
                  <TimeSince date={monitor.lastCheckIn} />
                ) : (
                  t('n/a')
                )}
              </PanelItemCentered>
            ))}
          </PanelBody>
        </Panel>
        {monitorListPageLinks && (
          <Pagination pageLinks={monitorListPageLinks} {...this.props} />
        )}
      </React.Fragment>
    );
  }
}

const HeaderTitle = styled(PageHeading)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
`;

const StyledSearchBar = styled(SearchBar)`
  flex: 1;
`;

const NewMonitorButton = styled(Button)`
  margin-right: ${space(2)};
`;

const PanelItemCentered = styled(PanelItem)`
  align-items: center;
  padding: 0;
  padding-left: ${space(2)};
  padding-right: ${space(2)};
`;

const StyledLink = styled(Link)`
  flex: 1;
  padding: ${space(2)};
`;

export default withRouter(withOrganization(Monitors));
