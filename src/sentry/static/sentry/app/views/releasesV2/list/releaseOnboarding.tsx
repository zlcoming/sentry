import React from 'react';
import styled from '@emotion/styled';

import ReleaseLanding from 'app/views/releases/list/releaseLanding';
import {Panel} from 'app/components/panels';

type Props = {};

const ReleaseOnboarding = ({}: Props) => {
  return (
    <StyledPanel>
      <ReleaseLanding />
    </StyledPanel>
  );
};

const StyledPanel = styled(Panel)`
  margin-bottom: 0;
`;

export default ReleaseOnboarding;
