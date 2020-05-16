import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import React from 'react';

import {Panel, PanelHeader, PanelBody} from 'sentry/components/panels';
import {URL_PARAM} from 'sentry/constants/globalSelectionHeader';
import {t} from 'sentry/locale';
import withApi from 'sentry/utils/withApi';
import CommitRow from 'sentry/components/commitRow';
import DropdownLink from 'sentry/components/dropdownLink';
import EmptyStateWarning from 'sentry/components/emptyStateWarning';
import LoadingError from 'sentry/components/loadingError';
import LoadingIndicator from 'sentry/components/loadingIndicator';
import MenuItem from 'sentry/components/menuItem';

class ReleaseCommits extends React.Component {
  static propTypes = {
    api: PropTypes.object,
  };

  state = {
    loading: true,
    error: false,
    commitList: [],
    activeRepo: null,
  };

  componentDidMount() {
    this.props.api.request(this.getPath(), {
      method: 'GET',
      // We need to omit global selection header url params because they are not supported
      data: omit(this.props.location.query, Object.values(URL_PARAM)),
      success: (data, _, jqXHR) => {
        this.setState({
          error: false,
          loading: false,
          commitList: data,
          pageLinks: jqXHR.getResponseHeader('Link'),
        });
      },
      error: () => {
        this.setState({
          error: true,
          loading: false,
        });
      },
    });
  }

  getPath() {
    const {orgId, projectId, release} = this.props.params;

    const encodedVersion = encodeURIComponent(release);

    return projectId
      ? `/projects/${orgId}/${projectId}/releases/${encodedVersion}/commits/`
      : `/organizations/${orgId}/releases/${encodedVersion}/commits/`;
  }

  emptyState() {
    return (
      <Panel>
        <EmptyStateWarning>
          <p>{t('There are no commits associated with this release.')}</p>
          {/* Todo: Should we link to repo settings from here?  */}
        </EmptyStateWarning>
      </Panel>
    );
  }

  setActiveRepo(repo) {
    this.setState({
      activeRepo: repo,
    });
  }

  getCommitsByRepository() {
    const {commitList} = this.state;
    const commitsByRepository = commitList.reduce(function(cbr, commit) {
      const {repository} = commit;
      if (!cbr.hasOwnProperty(repository.name)) {
        cbr[repository.name] = [];
      }

      cbr[repository.name].push(commit);
      return cbr;
    }, {});
    return commitsByRepository;
  }

  renderCommitsForRepo(repo) {
    const commitsByRepository = this.getCommitsByRepository();
    const activeCommits = commitsByRepository[repo];

    return (
      <Panel key={repo}>
        <PanelHeader>{repo}</PanelHeader>
        <PanelBody>
          {activeCommits.map(commit => (
            <CommitRow key={commit.id} commit={commit} />
          ))}
        </PanelBody>
      </Panel>
    );
  }

  render() {
    if (this.state.loading) {
      return <LoadingIndicator />;
    }

    if (this.state.error) {
      return <LoadingError />;
    }

    const {commitList, activeRepo} = this.state;

    if (!commitList.length) {
      return this.emptyState();
    }
    const commitsByRepository = this.getCommitsByRepository();
    return (
      <div>
        <div className="heading">
          {Object.keys(commitsByRepository).length > 1 ? (
            <div className="commits-dropdown align-left">
              <div className="commits-dropdowng">
                <DropdownLink caret title={this.state.activeRepo || 'All Repositories'}>
                  <MenuItem
                    key="all"
                    noAnchor
                    onClick={() => {
                      this.setActiveRepo(null);
                    }}
                    isActive={this.state.activeRepo === null}
                  >
                    <a>{t('All Repositories')}</a>
                  </MenuItem>
                  {Object.keys(commitsByRepository).map(repository => (
                    <MenuItem
                      key={commitsByRepository[repository].id}
                      noAnchor
                      onClick={() => {
                        this.setActiveRepo(repository);
                      }}
                      isActive={this.state.activeRepo === repository}
                    >
                      <a>{repository}</a>
                    </MenuItem>
                  ))}
                </DropdownLink>
              </div>
            </div>
          ) : null}
        </div>
        {activeRepo
          ? this.renderCommitsForRepo(activeRepo)
          : Object.keys(commitsByRepository).map(repository =>
              this.renderCommitsForRepo(repository)
            )}
      </div>
    );
  }
}

export {ReleaseCommits};

export default withApi(ReleaseCommits);
