import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

import {t} from 'sentry/locale';
import UserAvatar from 'sentry/components/avatar/userAvatar';
import DateTime from 'sentry/components/dateTime';
import EmptyMessage from 'sentry/views/settings/components/emptyMessage';
import Pagination from 'sentry/components/pagination';
import {Panel, PanelBody, PanelHeader, PanelItem} from 'sentry/components/panels';
import SelectField from 'sentry/components/forms/selectField';
import SettingsPageHeader from 'sentry/views/settings/components/settingsPageHeader';
import Tooltip from 'sentry/components/tooltip';
import overflowEllipsis from 'sentry/styles/overflowEllipsis';
import space from 'sentry/styles/space';

const UserInfo = styled('div')`
  display: flex;
  line-height: 1.2;
  font-size: 13px;
  flex: 1;
`;

const NameContainer = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Name = styled('div')`
  font-weight: 600;
  font-size: 15px;
`;
const Note = styled('div')`
  font-size: 13px;
  word-break: break-word;
`;
const OverflowBox = styled('div')`
  ${overflowEllipsis};
`;

const StyledPanelHeader = styled(PanelHeader)`
  display: grid;
  grid-template-columns: 1fr 150px 130px 150px;
  grid-column-gap: ${space(2)};
  padding: ${space(2)};
`;

const StyledPanelItem = styled(PanelItem)`
  display: grid;
  grid-template-columns: 1fr 150px 130px 150px;
  grid-column-gap: ${space(2)};
  padding: ${space(2)};
`;

const avatarStyle = {
  width: 36,
  height: 36,
  marginRight: 8,
};

class AuditLogList extends React.Component {
  static propTypes = {
    entries: PropTypes.array,
    pageLinks: PropTypes.string,
    eventType: PropTypes.string,
    eventTypes: PropTypes.arrayOf(PropTypes.string),
    onEventSelect: PropTypes.func,
  };

  render() {
    const {pageLinks, entries, eventType, eventTypes, onEventSelect} = this.props;
    const hasEntries = entries && entries.length > 0;
    const ipv4Length = 15;
    const options = [
      {value: '', label: t('Any action'), clearableVaue: false},
      ...eventTypes.map(type => ({label: type, value: type, clearableValue: false})),
    ];

    const action = (
      <form>
        <SelectField
          deprecatedSelectControl
          name="event"
          onChange={onEventSelect}
          value={eventType}
          style={{width: 250}}
          options={options}
          clearable
        />
      </form>
    );

    return (
      <div>
        <SettingsPageHeader title={t('Audit Log')} action={action} />
        <Panel>
          <StyledPanelHeader disablePadding>
            <div>{t('Member')}</div>
            <div>{t('Action')}</div>
            <div>{t('IP')}</div>
            <div>{t('Time')}</div>
          </StyledPanelHeader>

          <PanelBody>
            {!hasEntries && (
              <EmptyMessage>{t('No audit entries available')}</EmptyMessage>
            )}

            {hasEntries &&
              entries.map(entry => (
                <StyledPanelItem alignItems="center" key={entry.id}>
                  <UserInfo>
                    <div>
                      {entry.actor.email && (
                        <UserAvatar style={avatarStyle} user={entry.actor} />
                      )}
                    </div>
                    <NameContainer>
                      <Name data-test-id="actor-name">
                        {entry.actor.isSuperuser
                          ? t('%s (Sentry Staff)', entry.actor.name)
                          : entry.actor.name}
                      </Name>
                      <Note>{entry.note}</Note>
                    </NameContainer>
                  </UserInfo>
                  <div>{entry.event}</div>
                  <div>
                    <Tooltip
                      title={entry.ipAddress}
                      disabled={entry.ipAddress && entry.ipAddress.length <= ipv4Length}
                    >
                      <OverflowBox>{entry.ipAddress}</OverflowBox>
                    </Tooltip>
                  </div>
                  <div>
                    <DateTime date={entry.dateCreated} />
                  </div>
                </StyledPanelItem>
              ))}
          </PanelBody>
        </Panel>
        {pageLinks && <Pagination pageLinks={pageLinks} {...this.props} />}
      </div>
    );
  }
}

export default AuditLogList;
