import React from 'react';

import {shallow} from 'sentry-test/enzyme';
import Checkbox from 'sentry/components/checkbox';

describe('Checkbox', function() {
  it('renders', function() {
    const component = shallow(<Checkbox />);

    expect(component).toMatchSnapshot();
  });
});
