import React from 'react';
import {storiesOf} from '@storybook/react';
import {withInfo} from '@storybook/addon-info';
import {text, number} from '@storybook/addon-knobs';

import ClippedItems from 'app/components/clippedItems';

storiesOf('UI|ClippedItems', module).add(
  'default',
  withInfo('Component that clips container based on number of children')(() => {
    const maxVisibleItems = number('maxVisibleItems', 5);
    const fadeHeight = text('fadeHeight', '40px');
    return (
      <div>
        <ClippedItems maxVisibleItems={maxVisibleItems} fadeHeight={fadeHeight}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => {
            return <h3 key={i}>Item number {i}</h3>;
          })}
        </ClippedItems>
      </div>
    );
  })
);
