import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import styled from '@emotion/styled';

import SentryTypes from 'app/sentryTypes';
import LoadingError from 'app/components/loadingError';
import LoadingIndicator from 'app/components/loadingIndicator';
import Alert from 'app/components/alert';
import withApi from 'app/utils/withApi';
import withOrganization from 'app/utils/withOrganization';
import AssignLabel from 'app/components/assignLabel';
import {IconEdit, IconClose} from 'app/icons';
import {t} from 'app/locale';
import IssueLabelModal from 'app/components/issueLabelModal';

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
      showModal: false,
      editingLabel: null,
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
    const {api, environments, group, organization} = this.props;

    return api.request(`/organizations/${organization.slug}/labels/`, {
      method: 'PUT',
      query: {environment: environments},
      data: {
        issueId: group.id,
        labelId: label.id,
      },
      success: updatedGroup => {
        this.setState({issueLabels: updatedGroup.labels});
      },
      error: () => {
        this.setState({
          error: true,
          loading: false,
        });
      },
    });
  };

  onEditLabel = (name, color, labelId) => {
    // TODO: delete label option? <- DO THIS IN ISSUE SETTINGS IN THE FUTURE
    const {api, environments, organization} = this.props;

    api.request(`/organizations/${organization.slug}/labels/`, {
      method: 'POST',
      query: {environment: environments},
      data: {
        name,
        color,
        labelId,
      },
      success: editedLabel => {
        this.setState(prevState => ({
          organizationLabels: prevState.organizationLabels.map(label =>
            label.id === editedLabel.id ? editedLabel : label
          ),
          issueLabels: prevState.issueLabels.map(label =>
            label.id === editedLabel.id ? editedLabel : label
          ),
          editingLabel: null,
          showModal: false,
        }));
      },
      error: () => {
        this.setState({
          error: true,
          loading: false,
          editingLabel: null,
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
            <IssueLabel {...label}>
              {label.name}
              <StyledIconClose size="xs" onClick={() => this.onAssignLabel(label)} />
            </IssueLabel>
            <StyledIconEdit
              size="xs"
              onClick={() => this.setState({showModal: true, editingLabel: label})}
            />
          </LabelItem>
        );
      });
    }

    children.push(
      <LabelItem key={children.length}>
        <div className="btn-group">
          <AssignLabel
            busy={this.state.labelBusy}
            labels={filteredOrgLabels}
            onAssignLabel={this.onAssignLabel}
            onAddLabel={this.onAddLabel}
          />
        </div>
      </LabelItem>
    );

    return (
      <div>
        <Alert type="info">
          {'Labels are what they are. Learn how to '}
          <a href={this.getLabelsDocsUrl()}>add labels to issues</a>
        </Alert>
        <Container>{children}</Container>
        <IssueLabelModal
          show={this.state.showModal}
          onSubmit={this.onEditLabel}
          onCanceled={() => this.setState({showModal: false})}
          primaryButtonText={t('Save Label')}
          title={t('Edit Label')}
          label={this.state.editingLabel}
        />
      </div>
    );
  }
}

const Container = styled('div')`
  display: flex;
  flex-wrap: wrap;
  margin: 0 0 8px 0;
`;

const IssueLabel = styled(props => <div {...props}>{props.children}</div>)`
  color: ${p => p.theme.white};
  background-color: ${p => (p.color[0] === '#' ? p.color : '#' + p.color)};
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
`;

const StyledIconEdit = styled(IconEdit)`
  margin-left: 8px;
  cursor: pointer;
  visibility: hidden;
`;

const StyledIconClose = styled(IconClose)`
  margin-left: 8px;
  cursor: pointer;
`;

const LabelItem = styled('ul')`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  &:hover ${StyledIconEdit} {
    visibility: visible;
  }
  padding-left: 10px;
`;

export default withApi(withOrganization(GroupLabels));
