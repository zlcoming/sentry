import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import styled from '@emotion/styled';

import SentryTypes from 'app/sentryTypes';
import LoadingError from 'app/components/loadingError';
import LoadingIndicator from 'app/components/loadingIndicator';
import {Panel, PanelBody} from 'app/components/panels';
import Alert from 'app/components/alert';
import withApi from 'app/utils/withApi';
import space from 'app/styles/space';
import withOrganization from 'app/utils/withOrganization';
import AssignLabel from 'app/components/assignLabel';

class GroupLabels extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization.isRequired,
    group: SentryTypes.Group.isRequired,
    api: PropTypes.object.isRequired,
    environments: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  constructor(props) {
    super();
    this.state = {
      issueLabels: props.group.labels,
      organizationLabels: [],
      // TODO: handle busy logic for the add label, show spinner, disable buttons during api requests
      labelBusy: false,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.environments, this.props.environments)) {
      this.fetchData();
    }
  }

  fetchData = () => {
    const {api, environments, organization} = this.props;
    this.setState({
      loading: true,
      error: false,
    });

    api.request(`/organizations/${organization.slug}/labels/`, {
      query: {environment: environments},
      method: 'GET',
      success: data => {
        this.setState({
          organizationLabels: data,
          error: false,
          loading: false,
        });
      },
      error: () => {
        this.setState({
          error: true,
          loading: false,
        });
      },
    });
  };

  onAddLabel = (name, color) => {
    // TODO: delete label option?
    const {api, environments, organization} = this.props;

    api.request(`/organizations/${organization.slug}/labels/`, {
      method: 'POST',
      query: {environment: environments},
      data: {
        name,
        color,
      },
      success: label => {
        this.setState(prevState => ({
          organizationLabels: [...prevState.organizationLabels, label],
        }));
        // TODO: should we assign label here as well?
      },
      error: () => {
        this.setState({
          error: true,
          loading: false,
        });
      },
    });
  };

  onAssignLabel = label => {
    // TODO: unassign label from the issue
    const {api, environments, group, organization} = this.props;

    return api.request(`/organizations/${organization.slug}/labels/`, {
      method: 'PUT',
      query: {environment: environments},
      data: {
        issueId: group.id,
        labelId: label.id,
      },
      success: () => {
        this.setState(prevState => ({issueLabels: [...prevState.issueLabels, label]}));
      },
      error: () => {
        this.setState({
          error: true,
          loading: false,
        });
      },
    });
  };

  getLabelsDocsUrl() {
    return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  }

  render() {
    const {issueLabels, organizationLabels} = this.state;

    const issueLabelIds = issueLabels.map(lb => lb.id);
    // TODO: ugly and inefficient filter, filter better
    const filteredOrgLabels = organizationLabels.filter(
      orgLbl => !issueLabelIds.includes(orgLbl.id)
    );

    let children = [];

    if (this.state.loading) {
      return <LoadingIndicator />;
    } else if (this.state.error) {
      return <LoadingError onRetry={this.fetchData} />;
    }

    if (issueLabels) {
      children = issueLabels.map((label, labelIdx) => {
        return (
          <LabelItem key={labelIdx}>
            <Panel>
              <PanelBody withPadding>
                <IssueLabel {...label}>{label.name}</IssueLabel>
              </PanelBody>
            </Panel>
          </LabelItem>
        );
      });
    }

    children.push(
      <LabelItem key={children.length}>
        <Panel>
          <PanelBody withPadding>
            <div className="btn-group">
              <AssignLabel
                busy={this.state.labelBusy}
                labels={filteredOrgLabels}
                onAssignLabel={this.onAssignLabel}
                onAddLabel={this.onAddLabel}
              />
            </div>
          </PanelBody>
        </Panel>
      </LabelItem>
    );

    return (
      <div>
        <Container>{children}</Container>
        <Alert type="info">
          {'Labels are what they are. Learn how to '}
          <a href={this.getLabelsDocsUrl()}>add labels to issues</a>
        </Alert>
      </div>
    );
  }
}

const Container = styled('div')`
  display: flex;
  flex-wrap: wrap;
`;

const LabelItem = styled('div')`
  padding: 0 ${space(1)};
  width: 50%;
`;

const IssueLabel = styled(({name, ...props}) => <ul {...props}>{name}</ul>)`
  color: ${p => p.theme.white};
  background-color: ${p => (p.color[0] === '#' ? p.color : '#' + p.color)};
  font-weight: 700;
  padding: 2px 4px;
  border-radius: 4px;
`;

export default withApi(withOrganization(GroupLabels));
