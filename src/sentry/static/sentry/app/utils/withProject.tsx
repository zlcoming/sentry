import React from 'react';

import SentryTypes from 'sentry/sentryTypes';
import getDisplayName from 'sentry/utils/getDisplayName';
import {Project} from 'sentry/types';

type InjectedProjectProps = {
  project: Project;
};

/**
 * Currently wraps component with project from context
 */
const withProject = <P extends InjectedProjectProps>(
  WrappedComponent: React.ComponentType<P>
) =>
  class extends React.Component<
    Omit<P, keyof InjectedProjectProps> & Partial<InjectedProjectProps>
  > {
    static displayName = `withProject(${getDisplayName(WrappedComponent)})`;
    static contextTypes = {
      project: SentryTypes.Project,
    };

    render() {
      return (
        <WrappedComponent
          project={this.context.project as Project}
          {...(this.props as P)}
        />
      );
    }
  };

export default withProject;
