import React from 'react';
import * as ReactRouter from 'react-router';

import {initializeUrlState} from 'app/actionCreators/globalSelection';

type Props = {
  orgSlug: string;
} & Pick<ReactRouter.WithRouterProps, 'routes' | 'location'>;

/**
 * Loads project/environment from local storage if possible
 */
class InitializeGlobalSelectionHeader extends React.Component<Props> {
  componentDidMount() {
    const {location, orgSlug, routes} = this.props;

    // Make an exception for issue details in the case where it is accessed directly (e.g. from email)
    // We do not want to load the user's last used env/project in this case, otherwise will
    // lead to very confusing behavior.
    const skipLastUsed = !!routes.find(
      ({path}) => path && path.includes('/organizations/:orgId/issues/:groupId/')
    );
    initializeUrlState(orgSlug, location.query, {
      skipLastUsed,
    });
  }
  render() {
    return null;
  }
}

type ContainerProps = {
  orgSlug: string;
} & ReactRouter.WithRouterProps;

export default ReactRouter.withRouter(function InitializeGlobalSelectionHeaderContainer({
  orgSlug,
  routes,
  location,
}: ContainerProps) {
  // Since we pass orgSlug as key, this should only be called only when we first load the application or when org changes
  return (
    <InitializeGlobalSelectionHeader
      key={orgSlug}
      routes={routes}
      location={location}
      orgSlug={orgSlug}
    />
  );
});
