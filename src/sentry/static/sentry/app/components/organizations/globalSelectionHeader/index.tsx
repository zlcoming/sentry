import React from 'react';
import * as ReactRouter from 'react-router';

import {GlobalSelection, Organization, Project} from 'app/types';
import withGlobalSelection from 'app/utils/withGlobalSelection';
import withOrganization from 'app/utils/withOrganization';
import withProjectsSpecified from 'app/utils/withProjectsSpecified';

import GlobalSelectionHeader from './globalSelectionHeader';
import SyncStoreToUrl from './syncStoreToUrl';
import SyncUrlParams from './syncUrlParams';

type Props = {
  organization: Organization;
  selection: GlobalSelection;
  projects: Project[];
  loadingProjects: boolean;
} & ReactRouter.WithRouterProps &
  React.ComponentProps<typeof GlobalSelectionHeader>;

class GlobalSelectionHeaderContainer extends React.Component<Props> {
  render() {
    const {hasCustomRouting, location, router, selection} = this.props;

    return (
      <React.Fragment>
        <SyncUrlParams isDisabled={hasCustomRouting} location={location} />
        <SyncStoreToUrl
          isDisabled={hasCustomRouting}
          selection={selection}
          router={router}
        />
        <GlobalSelectionHeader {...this.props} />
      </React.Fragment>
    );
  }
}

export default withOrganization(
  withProjectsSpecified(
    ReactRouter.withRouter(withGlobalSelection(GlobalSelectionHeaderContainer))
  )
);
