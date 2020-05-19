import styled from '@emotion/styled';

import space from 'app/styles/space';

const Heading = styled('div')`
  font-size: ${p => p.theme.fontSizeMedium};
`;

const Header = styled('div')`
  display: grid;
  grid-template-columns: max-content max-content;
  grid-gap: ${space(0.5)};
  align-items: center;
  margin-bottom: ${space(1)};
`;

const Wrapper = styled('div')`
  margin-bottom: ${space(3)};
`;

export {Heading, Header, Wrapper};
