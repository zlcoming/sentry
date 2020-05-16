import styled from '@emotion/styled';

import space from 'sentry/styles/space';

const EventAnnotation = styled('span')`
  font-size: ${p => p.theme.fontSizeSmall};
  border-left: 1px solid ${p => p.theme.borderLight};
  padding-left: ${space(1)};
  color: ${p => p.theme.gray500};

  a {
    color: ${p => p.theme.gray500};

    &:hover {
      color: ${p => p.theme.gray600};
    }
  }
`;

export default EventAnnotation;
