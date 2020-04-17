import React from 'react';
import * as ReactRouter from 'react-router';

import {GlobalSelection} from 'app/types';
import {updateParamsWithoutHistory} from 'app/actionCreators/globalSelection';

type Props = {
  selection: GlobalSelection;
  router: ReactRouter.WithRouterProps['router'];
};

class SyncStoreToUrl extends React.Component<Props> {
  /**
   * This will only ever be mounted/unmounted and not updated because of `key` in Container
   */
  componentDidMount() {
    const {router, selection} = this.props;
    const {datetime, environments, projects} = selection;
    const otherParams = {environment: environments, ...datetime};
    console.group('SyncStoreToUrl.componentDidMount');
    console.log(projects, environments, datetime);

    // ignore default statsPeriod
    updateParamsWithoutHistory({project: projects, ...otherParams}, router);
    console.groupEnd();
  }

  render() {
    return null;
  }
}

type ContainerProps = {isDisabled?: boolean} & Props;

/**
 * This syncs Global Selection URL parameters with the GlobalSelectionStore
 */
class SyncStoreToUrlContainer extends React.Component<ContainerProps> {
  get serializedQuery() {
    const {datetime, environments, projects} = this.props.selection;
    const {period, start, end, utc} = datetime;

    // project and environment can be undefined/null
    return `project:${projects?.join(',') ?? ''}-environments:${environments?.join(',') ??
      ''}-period:${period}-start:${start}-end:${end}-utc:${utc}`;
  }

  render() {
    const {isDisabled, router, selection} = this.props;

    if (isDisabled) {
      return null;
    }

    console.log('SyncStoreToUrlContainer: ', selection, this.serializedQuery);
    return (
      <SyncStoreToUrl key={this.serializedQuery} router={router} selection={selection} />
    );
  }
}

export default SyncStoreToUrlContainer;
