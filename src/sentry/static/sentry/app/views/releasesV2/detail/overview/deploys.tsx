import React from 'react';
import styled from '@emotion/styled';

import {t} from 'sentry/locale';
import space from 'sentry/styles/space';
import {Deploy} from 'sentry/types';
import TimeSince from 'sentry/components/timeSince';
import DeployBadge from 'sentry/components/deployBadge';
import TextOverflow from 'sentry/components/textOverflow';

import {SectionHeading, Wrapper} from './styles';

type Props = {
  version: string;
  orgSlug: string;
  deploys: Deploy[];
};

const Deploys = ({version, orgSlug, deploys}: Props) => {
  return (
    <Wrapper>
      <SectionHeading>{t('Deploys')}</SectionHeading>

      {deploys.map(deploy => (
        <Row key={deploy.id}>
          <StyledDeployBadge deploy={deploy} orgSlug={orgSlug} version={version} />
          <TextOverflow>
            <TimeSince date={deploy.dateFinished} />
          </TextOverflow>
        </Row>
      ))}
    </Wrapper>
  );
};

const Row = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${space(1)};
  font-size: ${p => p.theme.fontSizeMedium};
  color: ${p => p.theme.gray600};
`;

const StyledDeployBadge = styled(DeployBadge)`
  margin-right: ${space(1)};
`;

export default Deploys;
