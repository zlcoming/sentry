import React from 'react';

import BasePlugin from 'sentry/plugins/basePlugin';

import Settings from './components/settings';

class SessionStackPlugin extends BasePlugin {
  renderSettings(props) {
    return <Settings plugin={this} {...props} />;
  }
}

SessionStackPlugin.displayName = 'SessionStack';

export default SessionStackPlugin;
