import React from 'react';

import {shallow} from 'sentry-test/enzyme';
import {BooleanField} from 'sentry/components/forms';

describe('BooleanField', function() {
  describe('render()', function() {
    it('renders without form context', function() {
      const wrapper = shallow(<BooleanField name="fieldName" />);
      expect(wrapper).toMatchSnapshot();
    });

    it('renders with form context', function() {
      const wrapper = shallow(<BooleanField name="fieldName" />, {
        context: {
          form: {
            data: {
              fieldName: true,
            },
            errors: {},
          },
        },
      });
      expect(wrapper).toMatchSnapshot();
    });
  });
});
