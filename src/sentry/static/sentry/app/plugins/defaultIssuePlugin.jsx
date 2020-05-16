import React from 'react';

import BasePlugin from 'sentry/plugins/basePlugin';
import IssueActions from 'sentry/plugins/components/issueActions';

export class DefaultIssuePlugin extends BasePlugin {
  renderGroupActions(props) {
    return <IssueActions plugin={this} {...props} />;
  }
}

DefaultIssuePlugin.DefaultIssueActions = IssueActions;

export default DefaultIssuePlugin;
