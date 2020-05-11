import React from 'react';
import styled from '@emotion/styled';

import Tooltip from 'app/components/tooltip';
import overflowEllipsis from 'app/styles/overflowEllipsis';
import {defined} from 'app/utils';
import {t} from 'app/locale';

type Props = {
  category?: string | null;
};

const BreadcrumbCategory = ({category}: Props) => {
  const title = !defined(category) ? t('generic') : category;
  return (
    <Wrapper>
      <Tooltip title={title}>
        <Category title={title}>{title}</Category>
      </Tooltip>
    </Wrapper>
  );
};

export default BreadcrumbCategory;

const Wrapper = styled('div')`
  display: flex;
`;

const Category = styled('div')`
  color: ${p => p.theme.gray5};
  font-size: ${p => p.theme.fontSizeSmall};
  font-weight: 700;
  ${overflowEllipsis};
`;
