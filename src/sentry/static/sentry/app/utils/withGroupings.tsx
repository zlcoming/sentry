import React from 'react';
import Reflux from 'reflux';
import createReactClass from 'create-react-class';

import {Group} from 'app/types';
import getDisplayName from 'app/utils/getDisplayName';
import GroupingStore from 'app/stores/groupingStore';

type InjectedProps = {};

type SimilarItem = {
  issue?: Group;
  score?: Record<string, any>;
  avgScore?: number;
  isBelowThreshold?: boolean;
};

type State = {
  similarItems: Array<SimilarItem>;
  filteredSimilarItems: Array<SimilarItem>;
  similarLinks: string;
};

/**
 * Higher order component that uses GroupingStore and provides a list of groupings
 */
const withGroupings = <P extends InjectedProps>(
  WrappedComponent: React.ComponentType<P>
) =>
  createReactClass<Omit<P, keyof InjectedProps>, State>({
    displayName: `withGroupings(${getDisplayName(WrappedComponent)})`,
    mixins: [Reflux.listenTo(GroupingStore, 'onGroupingUpdate') as any],

    getInitialState() {
      return {
        // @ts-ignore Property 'getSimilar' does not exist on type 'Store'
        ...GroupingStore.getSimilar(),
        similarItems: [
          {
            isBelowThreshold: false,
            issue: {
              id: '274',
            },
          },
          {
            isBelowThreshold: false,
            issue: {
              id: '275',
            },
          },
          {
            isBelowThreshold: false,
            issue: {
              id: '217',
            },
          },
        ],
        filteredSimilarItems: [
          {
            isBelowThreshold: true,
            issue: {
              id: '216',
            },
          },
        ],
      };
    },

    onGroupingUpdate(props) {
      console.log('props', props);
      // if (similarItems) {
      //   this.setState({
      //     similarItems,
      //     similarLinks,
      //     filteredSimilarItems,
      //   });
      //   return;
      // } else if (mergedParent && mergedParent !== this.props.params.groupId) {
      //   const {params} = this.props;
      //   // Merge success, since we can't specify target, we need to redirect to new parent
      //   browserHistory.push(
      //     `/organizations/${params.orgId}/issues/${mergedParent}/similar/`
      //   );
      // }
    },

    render() {
      return <WrappedComponent {...(this.props as P)} {...this.state} />;
    },
  });

export default withGroupings;
