import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

import {addErrorMessage, addSuccessMessage} from 'sentry/actionCreators/indicator';
import {t} from 'sentry/locale';
import AsyncComponent from 'sentry/components/asyncComponent';
import Avatar from 'sentry/components/avatar';
import EventOrGroupHeader from 'sentry/components/eventOrGroupHeader';
import LinkWithConfirmation from 'sentry/components/links/linkWithConfirmation';
import Tooltip from 'sentry/components/tooltip';
import {IconDelete} from 'sentry/icons';
import {Panel, PanelItem} from 'sentry/components/panels';
import EmptyMessage from 'sentry/views/settings/components/emptyMessage';
import space from 'sentry/styles/space';

class GroupTombstoneRow extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    onUndiscard: PropTypes.func.isRequired,
  };

  render() {
    const {data, onUndiscard} = this.props,
      actor = data.actor;

    return (
      <PanelItem alignItems="center">
        <StyledBox>
          <EventOrGroupHeader
            includeLink={false}
            hideIcons
            className="truncate"
            data={data}
          />
        </StyledBox>
        <AvatarContainer>
          {actor && (
            <Avatar
              user={data.actor}
              hasTooltip
              tooltip={t('Discarded by %s', actor.name || actor.email)}
            />
          )}
        </AvatarContainer>
        <ActionContainer>
          <Tooltip title={t('Undiscard')}>
            <LinkWithConfirmation
              title={t('Undiscard')}
              className="group-remove btn btn-default btn-sm"
              message={t(
                'Undiscarding this issue means that ' +
                  'incoming events that match this will no longer be discarded. ' +
                  'New incoming events will count toward your event quota ' +
                  'and will display on your issues dashboard. ' +
                  'Are you sure you wish to continue?'
              )}
              onConfirm={() => {
                onUndiscard(data.id);
              }}
            >
              <IconDelete className="undiscard" />
            </LinkWithConfirmation>
          </Tooltip>
        </ActionContainer>
      </PanelItem>
    );
  }
}

class GroupTombstones extends AsyncComponent {
  static propTypes = {
    orgId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
  };

  getEndpoints() {
    const {orgId, projectId} = this.props;
    return [['tombstones', `/projects/${orgId}/${projectId}/tombstones/`]];
  }

  handleUndiscard = tombstoneId => {
    const {orgId, projectId} = this.props;
    const path = `/projects/${orgId}/${projectId}/tombstones/${tombstoneId}/`;
    this.api
      .requestPromise(path, {
        method: 'DELETE',
      })
      .then(() => {
        addSuccessMessage(t('Events similar to these will no longer be filtered'));
        this.fetchData();
      })
      .catch(() => {
        addErrorMessage(t('We were unable to undiscard this issue'));
        this.fetchData();
      });
  };

  renderEmpty() {
    return (
      <Panel>
        <EmptyMessage>{t('You have no discarded issues')}</EmptyMessage>
      </Panel>
    );
  }

  renderBody() {
    const {tombstones} = this.state;

    return tombstones.length ? (
      <Panel>
        {tombstones.map(data => (
          <GroupTombstoneRow
            key={data.id}
            data={data}
            onUndiscard={this.handleUndiscard}
          />
        ))}
      </Panel>
    ) : (
      this.renderEmpty()
    );
  }
}

const StyledBox = styled('div')`
  flex: 1;
  align-items: center;
  min-width: 0; /* keep child content from stretching flex item */
`;

const AvatarContainer = styled('div')`
  margin: 0 ${space(4)};
  width: ${space(3)};
`;

const ActionContainer = styled('div')`
  width: ${space(4)};
`;

export default GroupTombstones;
