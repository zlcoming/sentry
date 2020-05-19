import React from 'react';
import styled from '@emotion/styled';

import {t} from 'app/locale';
import ActorAvatar from 'app/components/avatar/actorAvatar';
import SuggestedOwnerHovercard from 'app/components/group/suggestedOwnerHovercard';
import {Actor, Commit} from 'app/types';

import {Wrapper, Header, Heading} from './styles';

type Owner = {
  actor: Actor;
  commits: Array<Commit>;
  rules?: Array<any> | null;
};

type Props = {
  owners: Array<Owner>;
};

const SuggestedAssignees = ({owners}: Props) => (
  <Wrapper>
    <Header>
      <Heading>{t('Suggested Assignees')}</Heading>
      <StyledSmall>{t('Click to assign')}</StyledSmall>
    </Header>
    <div className="avatar-grid">
      {owners.map(({actor, rules, commits}, i) => (
        <SuggestedOwnerHovercard
          key={`${actor.id}:${actor.email}:${actor.name}:${i}`}
          actor={actor}
          rules={rules}
          commits={commits}
          containerClassName="avatar-grid-item"
        >
          <ActorAvatar hasTooltip={false} actor={actor} />
        </SuggestedOwnerHovercard>
      ))}
    </div>
  </Wrapper>
);

export {SuggestedAssignees};

const StyledSmall = styled('small')`
  background: ${p => p.theme.white};
`;
