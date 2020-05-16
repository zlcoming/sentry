import React from 'react';
import styled from '@emotion/styled';

import {t} from 'sentry/locale';
import space from 'sentry/styles/space';
import Button from 'sentry/components/button';
import Well from 'sentry/components/well';
import {IconCommit} from 'sentry/icons';

type Props = {
  orgId: string;
};

const ReleaseNoCommitData = ({orgId}: Props) => (
  <StyledWell centered>
    <IconCommit size="xl" />
    <h4>{t('Releases are better with commit data!')}</h4>
    <p>
      {t(
        'Connect a repository to see commit info, files changed, and authors involved in future releases.'
      )}
    </p>
    <Button priority="primary" to={`/settings/${orgId}/repos/`}>
      {t('Connect a repository')}
    </Button>
  </StyledWell>
);

const StyledWell = styled(Well)`
  background-color: ${p => p.theme.white};
  padding-top: ${space(2)};
  padding-bottom: ${space(4)};
`;

export default ReleaseNoCommitData;
