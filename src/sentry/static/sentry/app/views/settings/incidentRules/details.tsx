import {RouteComponentProps} from 'react-router/lib/Router';
import React from 'react';

import {IncidentRule} from 'sentry/views/settings/incidentRules/types';
import {Organization} from 'sentry/types';
import AsyncView from 'sentry/views/asyncView';
import RuleForm from 'sentry/views/settings/incidentRules/ruleForm';
import recreateRoute from 'sentry/utils/recreateRoute';

type RouteParams = {
  orgId: string;
  projectId: string;
  ruleId: string;
};

type Props = {
  organization: Organization;
} & RouteComponentProps<RouteParams, {}>;

type State = {
  rule: IncidentRule;
  actions: Map<string, any>; // This is temp
} & AsyncView['state'];

class IncidentRulesDetails extends AsyncView<Props, State> {
  getDefaultState() {
    return {
      ...super.getDefaultState(),
      actions: new Map(),
    };
  }

  getEndpoints(): [string, string][] {
    const {orgId, projectId, ruleId} = this.props.params;

    return [['rule', `/projects/${orgId}/${projectId}/alert-rules/${ruleId}/`]];
  }

  handleSubmitSuccess = () => {
    const {params, routes, router, location} = this.props;

    router.push(recreateRoute('', {params, routes, location, stepBack: -2}));
  };

  renderBody() {
    const {ruleId} = this.props.params;
    const {rule} = this.state;

    return (
      <RuleForm
        {...this.props}
        ruleId={ruleId}
        rule={rule}
        onSubmitSuccess={this.handleSubmitSuccess}
      />
    );
  }
}

export default IncidentRulesDetails;
