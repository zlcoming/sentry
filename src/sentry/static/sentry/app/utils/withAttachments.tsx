import React from 'react';

import {Client} from 'app/api';
import {EventAttachment} from 'app/types';
import getDisplayName from 'app/utils/getDisplayName';

type DependentProps = {
  api: Client;
  orgSlug: string;
};

type InjectedProps = {
  attachments: EventAttachment;
};

const withAttachment = <P extends InjectedProps>(
  WrappedComponent: React.ComponentType<P>
) =>
  class extends React.Component<
    Omit<P, keyof InjectedProps> & Partial<InjectedProps> & DependentProps
  > {
    static displayName = `withAttachment(${getDisplayName(WrappedComponent)})`;

    render() {
      return (
        <WrappedComponent
          //   attachments={... as EventAttachment[]}
          {...(this.props as P & DependentProps)}
        />
      );
    }
  };

export default withAttachment;
