import React from 'react';
import isEqual from 'lodash/isEqual';

import SentryTypes from 'sentry/sentryTypes';
import EventUserFeedback from 'sentry/components/events/userFeedback';
import LoadingError from 'sentry/components/loadingError';
import LoadingIndicator from 'sentry/components/loadingIndicator';
import {Panel} from 'sentry/components/panels';
import Pagination from 'sentry/components/pagination';
import withOrganization from 'sentry/utils/withOrganization';
import UserFeedbackEmpty from 'sentry/views/userFeedback/userFeedbackEmpty';

import {fetchGroupUserReports} from './utils';

class GroupUserFeedback extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization.isRequired,
    group: SentryTypes.Group.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: false,
      reportList: [],
      pageLinks: '',
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.params, this.props.params)) {
      this.fetchData();
    }
  }

  fetchData = () => {
    this.setState({
      loading: true,
      error: false,
    });

    fetchGroupUserReports(this.props.group.id, this.props.params)
      .then(([data, _, jqXHR]) => {
        this.setState({
          error: false,
          loading: false,
          reportList: data,
          pageLinks: jqXHR.getResponseHeader('Link'),
        });
      })
      .catch(() => {
        this.setState({
          error: true,
          loading: false,
        });
      });
  };

  render() {
    const {reportList} = this.state;
    const {organization, group} = this.props;

    if (this.state.loading) {
      return <LoadingIndicator />;
    } else if (this.state.error) {
      return <LoadingError onRetry={this.fetchData} />;
    }

    if (reportList.length) {
      return (
        <div className="row">
          <div className="col-md-9">
            {reportList.map((item, idx) => (
              <EventUserFeedback
                key={idx}
                report={item}
                orgId={organization.slug}
                issueId={group.id}
              />
            ))}
            <Pagination pageLinks={this.state.pageLinks} />
          </div>
        </div>
      );
    }

    return (
      <Panel>
        <UserFeedbackEmpty projectIds={[group.project.id]} />
      </Panel>
    );
  }
}

export default withOrganization(GroupUserFeedback);
