import React from 'react';

import {shallow} from 'sentry-test/enzyme';
import ClippedItems from 'app/components/clippedItems';

const children = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
  return <h3 key={i}>Item number {i}</h3>;
});

describe('ClippedItems', function() {
  it('clips items', function() {
    const wrapper = shallow(<ClippedItems maxVisibleItems={3}>{children}</ClippedItems>);

    expect(wrapper.find('h3').length).toBe(3);
  });

  it('reveals/collapses items', function() {
    const wrapper = shallow(<ClippedItems>{children}</ClippedItems>);

    // reveal all items
    const showMoreButton = wrapper.find('[data-test-id="show-more"]');
    expect(showMoreButton.text()).toBe('Show 4 More');
    showMoreButton.simulate('click');
    expect(wrapper.find('h3').length).toBe(9);

    // collapse back
    const collapseButton = wrapper.find('[data-test-id="collapse"]');
    expect(collapseButton.text()).toBe('Collapse');
    collapseButton.simulate('click');
    expect(wrapper.find('h3').length).toBe(5);
  });
});
