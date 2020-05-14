import React from 'react';
import styled from '@emotion/styled';

import {t} from 'app/locale';
import space from 'app/styles/space';

import {GridCell} from './styles';

const BreadcrumbsListHeader = () => {
  return (
    <React.Fragment>
      <StyledGridCellLeft>{t('Type')}</StyledGridCellLeft>
      <StyledGridCellCategory>{t('Category')}</StyledGridCellCategory>
      <StyledGridCell>{t('Description')}</StyledGridCell>
      <StyledGridCell>{t('Level')}</StyledGridCell>
      <StyledGridCellRight>{t('Time')}</StyledGridCellRight>
    </React.Fragment>
  );
};

export default BreadcrumbsListHeader;

const StyledGridCell = styled(GridCell)`
  border-top: 0;
  border-bottom: 0;
  position: relative;
  background: ${p => p.theme.offWhite};
  color: ${p => p.theme.gray3};
  font-weight: 600;
  text-transform: uppercase;
  line-height: 1;
  font-size: ${p => p.theme.fontSizeExtraSmall};

  @media (min-width: ${p => p.theme.breakpoints[0]}) {
    padding: ${space(2)} ${space(2)};
    font-size: ${p => p.theme.fontSizeSmall};
  }
  :after {
    content: '';
    height: 1px;
    width: 100%;
    background-color: ${p => p.theme.borderDark};
    z-index: 1;
    position: absolute;
    bottom: 0;
    left: 0;
  }
`;

const StyledGridCellLeft = styled(StyledGridCell)`
  border-radius: ${p => p.theme.borderRadius} 0 0 0;
  border-left: 1px solid ${p => p.theme.borderDark};
`;

const StyledGridCellRight = styled(StyledGridCell)`
  border-radius: 0 ${p => p.theme.borderRadius} 0 0;
  border-right: 1px solid ${p => p.theme.borderDark};
`;

const StyledGridCellCategory = styled(StyledGridCell)`
  @media (min-width: ${p => p.theme.breakpoints[0]}) {
    padding-left: ${space(1)};
  }
`;
