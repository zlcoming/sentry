import React from 'react';
import * as ReactRouter from 'react-router';

import {
  updateDateTime,
  updateEnvironments,
  updateProjects,
} from 'app/actionCreators/globalSelection';

import {getStateFromQuery} from './utils';

type Props = {
  location: ReactRouter.WithRouterProps['location'];
};

class SyncUrlParams extends React.Component<Props> {
  /**
   * This will only ever be mounted/unmounted and not updated because of `key` in Container
   */
  componentDidMount() {
    const {location} = this.props;
    const {
      project,
      environment,
      period,
      start,
      end,
      utc,
    } = getStateFromQuery(location.query, {allowEmptyPeriod: true});

    if (project || environment) {
      updateProjects(project || []);
      updateEnvironments(environment || []);
    }

    // TODO: Test this more with different combinations, need to make sure we're not
    // changing default date time
    if (start || end || period) {
      updateDateTime({start, end, period, utc});
    }
  }

  render() {
    return null;
  }
}

type ContainerProps = {isDisabled?: boolean} & Props;

/**
 * This syncs Global Selection URL parameters with the GlobalSelectionStore
 */
class SyncUrlParamsContainer extends React.Component<ContainerProps> {
  get serializedQuery() {
    const {location} = this.props;
    const {
      project,
      environment,
      period,
      start,
      end,
      utc,
    } = getStateFromQuery(location.query, {allowEmptyPeriod: true});

    // project and environment can be undefined/null
    return `project:${project?.join(',') ?? ''}-environment:${environment?.join(',') ??
      ''}-period:${period}-start:${start}-end:${end}-utc:${utc}`;
  }

  render() {
    const {isDisabled, location} = this.props;

    if (isDisabled) {
      return null;
    }
    return <SyncUrlParams key={this.serializedQuery} location={location} />;
  }
}

export default SyncUrlParamsContainer;
