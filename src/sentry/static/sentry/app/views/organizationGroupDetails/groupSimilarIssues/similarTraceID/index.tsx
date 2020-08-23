import React from 'react';
import {Location} from 'history';
import styled from '@emotion/styled';

import SentryTypes from 'app/sentryTypes';
import {Organization, Event} from 'app/types';
import space from 'app/styles/space';

import Body from './body';
import Header from './header';

type Props = {
  event: Event;
  organization: Organization;
  location: Location;
};

const SimilarTraceID = ({event, ...props}: Props) => {
  const traceID = event.contexts?.trace?.trace_id;
  return (
    <Wrapper>
      <Header traceID={traceID} />
      <Body traceID={traceID} event={event} {...props} />
    </Wrapper>
  );
};

SimilarTraceID.propTypes = {
  event: SentryTypes.Event,
};

export default SimilarTraceID;

const Wrapper = styled('div')`
  display: grid;
  grid-gap: ${space(2)};
`;
