import React from 'react';

import {mount} from 'sentry-test/enzyme';
import {OrganizationRoot} from 'sentry/views/organizationRoot';
import {setActiveProject} from 'sentry/actionCreators/projects';
import {setLastRoute} from 'sentry/actionCreators/navigation';

jest.mock('sentry/actionCreators/projects', () => ({
  setActiveProject: jest.fn(),
}));

jest.mock('sentry/actionCreators/navigation', () => ({
  setLastRoute: jest.fn(),
}));

describe('OrganizationRoot', function() {
  it('sets active project as null when mounted', function() {
    mount(<OrganizationRoot location={{}}>{null}</OrganizationRoot>);

    expect(setActiveProject).toHaveBeenCalledWith(null);
  });

  it('calls `setLastRoute` when unmounted', function() {
    const wrapper = mount(
      <OrganizationRoot location={{pathname: '/org-slug/dashboard/'}}>
        {null}
      </OrganizationRoot>
    );

    wrapper.unmount();

    expect(setLastRoute).toHaveBeenCalledWith('/org-slug/dashboard/');
  });

  it('calls `setLastRoute` when unmounted with query string', function() {
    const wrapper = mount(
      <OrganizationRoot location={{pathname: '/org-slug/dashboard/', search: '?test=1'}}>
        {null}
      </OrganizationRoot>
    );

    wrapper.unmount();

    expect(setLastRoute).toHaveBeenCalledWith('/org-slug/dashboard/?test=1');
  });
});
