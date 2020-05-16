import React from 'react';
import styled from '@emotion/styled';

import space from 'sentry/styles/space';
import Tooltip from 'sentry/components/tooltip';
import {tct} from 'sentry/locale';
import {defined} from 'sentry/utils';

type Props = {
  type: string;
  exceptionModule?: string;
};

const ExceptionTitle = ({type, exceptionModule}: Props) => {
  if (defined(exceptionModule)) {
    return (
      <Tooltip title={tct('from [exceptionModule]', {exceptionModule})}>
        <Title>{type}</Title>
      </Tooltip>
    );
  }

  return <Title>{type}</Title>;
};

export default ExceptionTitle;

const Title = styled('h5')`
  margin-bottom: ${space(0.5)};
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;
