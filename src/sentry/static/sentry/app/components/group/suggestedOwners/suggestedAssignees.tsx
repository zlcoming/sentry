import React from 'react';
import styled from '@emotion/styled';
import {css} from '@emotion/core';

import {t} from 'sentry/locale';
import ActorAvatar from 'sentry/components/avatar/actorAvatar';
import SuggestedOwnerHovercard from 'sentry/components/group/suggestedOwnerHovercard';
import {Actor, Commit} from 'sentry/types';
import space from 'sentry/styles/space';

import {Wrapper, Header, Heading} from './styles';

type Owner = {
  actor: Actor;
  commits?: Array<Commit>;
  rules?: Array<any> | null;
};

type Props = {
  owners: Array<Owner>;
  onAssign: (actor: Actor) => () => void;
};

const SuggestedAssignees = ({owners, onAssign}: Props) => (
  <Wrapper>
    <Header>
      <Heading>{t('Suggested Assignees')}</Heading>
      <StyledSmall>{t('Click to assign')}</StyledSmall>
    </Header>
    <Content>
      {owners.map((owner, i) => (
        <SuggestedOwnerHovercard
          key={`${owner.actor.id}:${owner.actor.email}:${owner.actor.name}:${i}`}
          {...owner}
        >
          <ActorAvatar
            css={css`
              cursor: pointer;
            `}
            onClick={onAssign(owner.actor)}
            hasTooltip={false}
            actor={owner.actor}
          />
        </SuggestedOwnerHovercard>
      ))}
    </Content>
  </Wrapper>
);

export {SuggestedAssignees};

const StyledSmall = styled('small')`
  font-size: ${p => p.theme.fontSizeExtraSmall};
  color: ${p => p.theme.gray500};
  line-height: 100%;
`;

const Content = styled('div')`
  display: grid;
  grid-gap: ${space(0.5)};
  grid-template-columns: repeat(auto-fill, 20px);
`;
