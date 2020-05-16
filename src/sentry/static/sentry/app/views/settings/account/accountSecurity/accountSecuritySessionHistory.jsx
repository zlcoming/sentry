import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

import {Panel, PanelBody, PanelHeader, PanelItem} from 'sentry/components/panels';
import {t} from 'sentry/locale';
import AsyncView from 'sentry/views/asyncView';
import ListLink from 'sentry/components/links/listLink';
import NavTabs from 'sentry/components/navTabs';
import SettingsPageHeader from 'sentry/views/settings/components/settingsPageHeader';
import TimeSince from 'sentry/components/timeSince';
import recreateRoute from 'sentry/utils/recreateRoute';
import space from 'sentry/styles/space';

class SessionRow extends React.Component {
  static propTypes = {
    ipAddress: PropTypes.string.isRequired,
    countryCode: PropTypes.string,
    regionCode: PropTypes.string,
    lastSeen: PropTypes.string.isRequired,
    firstSeen: PropTypes.string.isRequired,
  };

  render() {
    const {ipAddress, countryCode, regionCode, lastSeen, firstSeen} = this.props;

    return (
      <SessionPanelItem>
        <IpAndLocation>
          <div>
            <IpAddress>{ipAddress}</IpAddress>
            {countryCode && regionCode && (
              <CountryCode>
                {countryCode} ({regionCode})
              </CountryCode>
            )}
          </div>
        </IpAndLocation>
        <StyledTimeSince date={firstSeen} />
        <StyledTimeSince date={lastSeen} />
      </SessionPanelItem>
    );
  }
}

const IpAddress = styled('div')`
  margin-bottom: ${space(0.5)};
  font-weight: bold;
`;
const CountryCode = styled('div')`
  font-size: ${p => p.theme.fontSizeRelativeSmall};
`;

const StyledTimeSince = styled(TimeSince)`
  font-size: ${p => p.theme.fontSizeRelativeSmall};
`;

const IpAndLocation = styled('div')`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

class AccountSecuritySessionHistory extends AsyncView {
  getTitle() {
    return t('Session History');
  }

  getEndpoints() {
    return [['ipList', '/users/me/ips/']];
  }

  renderBody() {
    const {ipList} = this.state;

    return (
      <React.Fragment>
        <SettingsPageHeader
          title="Security"
          tabs={
            <NavTabs underlined>
              <ListLink to={recreateRoute('', {...this.props, stepBack: -1})} index>
                {t('Settings')}
              </ListLink>
              <ListLink to={recreateRoute('', this.props)}>
                {t('Session History')}
              </ListLink>
            </NavTabs>
          }
        />

        <Panel>
          <SessionPanelHeader>
            <div>{t('Sessions')}</div>
            <div>{t('First Seen')}</div>
            <div>{t('Last Seen')}</div>
          </SessionPanelHeader>

          <PanelBody>
            {ipList.map(ipObj => (
              <SessionRow key={ipObj.id} {...ipObj} />
            ))}
          </PanelBody>
        </Panel>
      </React.Fragment>
    );
  }
}

export default AccountSecuritySessionHistory;

const getTableLayout = () => `
  display: grid;
  grid-template-columns: auto 140px 140px;
  grid-gap ${space(1)};
  align-items: center;
`;

const SessionPanelHeader = styled(PanelHeader)`
  ${getTableLayout}
  justify-content: initial;
`;

const SessionPanelItem = styled(PanelItem)`
  ${getTableLayout}
`;
