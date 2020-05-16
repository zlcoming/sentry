import React from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';

import {t} from 'sentry/locale';
import {IconClock} from 'sentry/icons';
import space from 'sentry/styles/space';
import TimeSince from 'sentry/components/timeSince';
import overflowEllipsis from 'sentry/styles/overflowEllipsis';

/**
 * Renders the first & last seen times for a group or event with
 * a clock icon.
 */

type Props = {
  lastSeen: string;
  firstSeen: string;
};

const Times = ({lastSeen, firstSeen}: Props) => (
  <Container>
    <FlexWrapper>
      {lastSeen && (
        <React.Fragment>
          <StyledIconClock size="11px" />
          <TimeSince date={lastSeen} suffix={t('ago')} />
        </React.Fragment>
      )}
      {firstSeen && lastSeen && (
        <span className="hidden-xs hidden-sm">&nbsp;—&nbsp;</span>
      )}
      {firstSeen && (
        <TimeSince date={firstSeen} suffix={t('old')} className="hidden-xs hidden-sm" />
      )}
    </FlexWrapper>
  </Container>
);
Times.propTypes = {
  lastSeen: PropTypes.string,
  firstSeen: PropTypes.string,
};

const Container = styled('div')`
  flex-shrink: 1;
  min-width: 0; /* flex-hack for overflow-ellipsised children */
`;

const FlexWrapper = styled('div')`
  ${overflowEllipsis}

  /* The following aligns the icon with the text, fixes bug in Firefox */
  display: flex;
  align-items: center;
`;

const StyledIconClock = styled(IconClock)`
  /* this is solely for optics, since TimeSince always begins
  with a number, and numbers do not have descenders */
  margin-right: ${space(0.5)};
`;

export default Times;
