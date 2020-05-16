import React from 'react';

import {shallow} from 'sentry-test/enzyme';
import CircleIndicator from 'sentry/components/circleIndicator';

describe('CircleIndicator', function() {
  it('renders', function() {
    const wrapper = shallow(<CircleIndicator />);
    expect(wrapper).toMatchSnapshot();
  });
});
