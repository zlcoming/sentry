import React from 'react';

import {openCreateOwnershipRule} from 'app/actionCreators/modal';
import withApi from 'app/utils/withApi';
import withOrganization from 'app/utils/withOrganization';
import {Organization, Group, Event, Actor, Commit, Project} from 'app/types';
import {Client} from 'app/api';

import {findMatchedRules, Rules} from './findMatchedRules';
import {SuggestedAssignees} from './suggestedAssignees';
import {OwnershipRules} from './ownershipRules';

type Committer = {
  author: Actor;
  commits: Array<Commit>;
};

type Props = {
  api: Client;
  organization: Organization;
  project: Project;
  group: Group;
  event: Event;
};

type State = {
  rules: Rules;
  owners: Array<Actor>;
  committers: Array<Committer>;
};

class SuggestedOwners extends React.Component<Props, State> {
  state: State = {
    rules: null,
    owners: [],
    committers: [],
  };

  componentDidMount() {
    this.fetchData(this.props.event);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.event && prevProps.event) {
      if (this.props.event.id !== prevProps.event.id) {
        //two events, with different IDs
        this.fetchData(this.props.event);
      }
      return;
    }

    if (this.props.event) {
      //going from having no event to having an event
      this.fetchData(this.props.event);
    }
  }

  async fetchData(event: Event) {
    if (!event) {
      return;
    }

    // No committers if you don't have any releases
    if (!!this.props.group.firstRelease) {
      this.fetchCommitters(event.id);
    }

    this.fetchOwners(event.id);
  }

  fetchCommitters = async (eventId: Event['id']) => {
    const {api, project, organization} = this.props;
    // TODO: move this into a store since `EventCause` makes this exact request as well
    await api
      .requestPromise(
        `/projects/${organization.slug}/${project.slug}/events/${eventId}/committers/`
      )
      .then(data => {
        this.setState({
          committers: data.committers,
        });
      })
      .catch(() => {
        this.setState({
          committers: [],
        });
      });
  };

  fetchOwners = async (eventId: Event['id']) => {
    const {api, project, organization} = this.props;
    await api
      .requestPromise(
        `/projects/${organization.slug}/${project.slug}/events/${eventId}/owners/`
      )
      .then(data => {
        this.setState({
          owners: data.owners,
          rules: data.rules,
        });
      })
      .catch(() => {
        this.setState({
          committers: [],
        });
      });
  };

  /**
   * Combine the commiter and ownership data into a single array, merging
   * users who are both owners based on having commits, and owners matching
   * project ownership rules into one array.
   *
   * The return array will include objects of the format:
   *
   * {
   *   actor: <
   *    type,              # Either user or team
   *    SentryTypes.User,  # API expanded user object
   *    {email, id, name}  # Sentry user which is *not* expanded
   *    {email, name}      # Unidentified user (from commits)
   *    {id, name},        # Sentry team (check `type`)
   *   >,
   *
   *   # One or both of commits and rules will be present
   *
   *   commits: [...]  # List of commits made by this owner
   *   rules:   [...]  # Project rules matched for this owner
   * }
   */
  getOwnerList(): React.ComponentProps<typeof SuggestedAssignees>['owners'] {
    const owners = this.state.committers.map(commiter => ({
      actor: {...commiter.author, type: 'user' as Actor['type']},
      commits: commiter.commits,
    }));

    this.state.owners.forEach(owner => {
      const normalizedOwner = {
        actor: owner,
        rules: findMatchedRules(this.state.rules || [], owner),
      };

      const existingIdx = owners.findIndex(o => o.actor.email === owner.email);
      if (existingIdx > -1) {
        owners[existingIdx] = {...normalizedOwner, ...owners[existingIdx]};
        return;
      }
      owners.push({...normalizedOwner, commits: []});
    });

    return owners;
  }

  handleOpenCreateOwnershipRule = () => {
    const {organization, project} = this.props;
    openCreateOwnershipRule({
      project,
      organization,
    });
  };

  render() {
    const {organization, project} = this.props;
    const owners: React.ComponentProps<typeof SuggestedAssignees>['owners'] = [
      {
        actor: {
          id: '1',
          type: 'user',
          username: 'foo@example.com',
          email: 'foo@example.com',
          name: 'Foo Bar',
          isAuthenticated: true,
          options: {
            timezone: 'UTC',
          },
          hasPasswordAuth: true,
          flags: {
            newsletter_consent_prompt: false,
          },
        },
        rules: [],
        commits: [],
      },
    ];

    return (
      <React.Fragment>
        {owners.length > 0 && <SuggestedAssignees owners={owners} />}
        <OwnershipRules project={project} organization={organization} />
      </React.Fragment>
    );
  }
}
export {SuggestedOwners};
export default withApi(withOrganization(SuggestedOwners));
