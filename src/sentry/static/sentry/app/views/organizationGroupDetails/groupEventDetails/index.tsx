import React from 'react';
import {RouteComponentProps} from 'react-router/lib/Router';

import {fetchOrganizationEnvironments} from 'sentry/actionCreators/environments';
import {t} from 'sentry/locale';
import GroupEventDetails from 'sentry/views/organizationGroupDetails/groupEventDetails/groupEventDetails';
import LoadingError from 'sentry/components/loadingError';
import LoadingIndicator from 'sentry/components/loadingIndicator';
import OrganizationEnvironmentsStore from 'sentry/stores/organizationEnvironmentsStore';
import {Client} from 'sentry/api';
import {GlobalSelection, Organization, Environment, Project, Group} from 'sentry/types';
import withApi from 'sentry/utils/withApi';
import withGlobalSelection from 'sentry/utils/withGlobalSelection';
import withOrganization from 'sentry/utils/withOrganization';

type Props = RouteComponentProps<
  {orgId: string; groupId: string; eventId?: string},
  {}
> & {
  api: Client;
  organization: Organization;
  selection: GlobalSelection;
  project: Project;
  group: Group;
};

type State = {
  environments: Environment[];
  error: Error;
};

export class GroupEventDetailsContainer extends React.Component<Props, State> {
  state = OrganizationEnvironmentsStore.get();

  componentDidMount() {
    this.environmentUnsubscribe = OrganizationEnvironmentsStore.listen(data =>
      this.setState(data)
    );
    const {environments, error} = OrganizationEnvironmentsStore.get();
    if (!environments && !error) {
      fetchOrganizationEnvironments(this.props.api, this.props.organization.slug);
    }
  }

  componentWillUnmount() {
    if (this.environmentUnsubscribe) {
      this.environmentUnsubscribe();
    }
  }

  // TODO(ts): reflux :(
  environmentUnsubscribe: any;

  render() {
    if (this.state.error) {
      return (
        <LoadingError
          message={t("There was an error loading your organization's environments")}
        />
      );
    }
    // null implies loading state
    if (!this.state.environments) {
      return <LoadingIndicator />;
    }
    const {selection, ...otherProps} = this.props;
    const environments: Environment[] = this.state.environments.filter(env =>
      selection.environments.includes(env.name)
    );
    return <GroupEventDetails {...otherProps} environments={environments} />;
  }
}

export default withApi(withOrganization(withGlobalSelection(GroupEventDetailsContainer)));
