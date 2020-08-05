import {keyframes} from '@emotion/core';
import React from 'react';
import styled from '@emotion/styled';
import space from 'app/styles/space';
import theme from 'app/utils/theme';



const HEADER_HEIGHT = 60;

export const BadgesWrapper = styled('div')`
  display: flex;
  flex: 1;
`;

export const BadgesContainer = styled('div')`
  display: flex;
  width: 100%;
  height: 100vh;
  position: relative;

  margin-bottom: -20px;

  .control-group {
    margin-bottom: 0; /* Do not want the global control-group margins  */
  }
`;

export const HeadingContainer = styled('div')`
  display: flex;
  min-width: 70px;
  margin: ${space(1)} 0 ${space(2)};
  align-items: center;
`;
