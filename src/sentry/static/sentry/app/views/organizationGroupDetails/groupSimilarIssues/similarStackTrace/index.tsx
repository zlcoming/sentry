import React from 'react';
import styled from '@emotion/styled';
import {Location} from 'history';

import withOrganization from 'app/utils/withOrganization';
import space from 'app/styles/space';
import {t} from 'app/locale';
import AsyncComponent from 'app/components/asyncComponent';
import withGroupings from 'app/utils/withGroupings';
import {Project, Organization, Group, Event} from 'app/types';
import Alert from 'app/components/alert';
import {IconWarning} from 'app/icons';
import Tooltip from 'app/components/tooltip';
import Switch from 'app/components/switch';
// import GroupingActions from 'app/actions/groupingActions';

import List from './list';

type Props = AsyncComponent['props'] & {
  project: Project;
  location: Location;
  organization: Organization;
  similarItems: Array<any>;
  filteredSimilarItems: Array<any>;
  similarLinks: string;
  group: Group;
  event: Event;
};

type State = AsyncComponent['state'] & {
  v2: boolean;
};

class SimilarStackStrace extends AsyncComponent<Props, State> {
  // getEndpoints(): ReturnType<AsyncComponent['getEndpoints']> {
  //   if (this.hasSimilarityFeature()) {
  //     return;
  //   }
  //   // const {organization, event, projectId} = this.props;

  //   // let path = `/projects/${organization.slug}/${projectId}/events/${event.id}/grouping-info/`;
  //   // if (this.state?.configOverride) {
  //   //   path = `${path}?config=${this.state.configOverride}`;
  //   // }

  //   // return [['groupInfo', path]];
  // }

  getDefaultState() {
    return {
      ...super.getDefaultState(),
      v2: false,
    };
  }

  toggleSimilarityVersion() {
    this.setState(prevState => ({v2: !prevState.v2}));
  }

  hasSimilarityFeature() {
    return this.props.project.features.includes('similarity-view');
  }

  handleMerge() {
    // const {query, params} = this.props;
    // if (params) {
    //   // You need at least 1 similarItem OR filteredSimilarItems to be able to merge,
    //   // so `firstIssue` should always exist from one of those lists.
    //   //
    //   // Similar issues API currently does not return issues across projects,
    //   // so we can assume that the first issues project slug is the project in
    //   // scope
    //   const [firstIssue] = this.state.similarItems.length
    //     ? this.state.similarItems
    //     : this.state.filteredSimilarItems;
    //   GroupingActions.merge({
    //     params,
    //     query,
    //     projectId: firstIssue.issue.project.slug,
    //   });
    // }
  }

  renderBody() {
    const {
      project,
      group,
      organization,
      filteredSimilarItems,
      similarLinks,
      similarItems,
    } = this.props;

    const hasV2 = project.features.includes('similarity-view-v2');
    const hasSimilarityFeature = project.features.includes('similarity-view-v2');

    const hasSimilarItems =
      hasSimilarityFeature &&
      (similarItems.length >= 0 || filteredSimilarItems.length >= 0);

    const orgId = organization.id;
    const groupId = group.id;

    return (
      <div>
        <Alert type="warning" icon={<IconWarning size="md" />}>
          {t(
            'This is an experimental feature. Data may not be immediately available while we process unmerges.'
          )}
        </Alert>
        {hasV2 && (
          <SwitchContainer>
            💩
            <Tooltip
              title={
                this.state.v2
                  ? t('Using new algorithm, click to go back')
                  : t('Using old algorithm, click to try new')
              }
            >
              <Switch
                size="lg"
                isActive={this.state.v2}
                toggle={this.toggleSimilarityVersion}
              />
            </Tooltip>
            ✨
          </SwitchContainer>
        )}
        {hasSimilarItems && (
          <List
            items={similarItems}
            filteredItems={filteredSimilarItems}
            onMerge={this.handleMerge}
            orgId={orgId}
            groupId={groupId}
            pageLinks={similarLinks}
          />
        )}
      </div>
    );
  }
}

export default withGroupings(withOrganization(SimilarStackStrace));

const SwitchContainer = styled('div')`
  text-align: center;
  line-height: 0;
  font-size: 24px;

  > * {
    vertical-align: middle;
    margin: ${space(1)};
  }
`;
