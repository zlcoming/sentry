import PropTypes from 'prop-types';
import React from 'react';
import {RouteComponentProps} from 'react-router/lib/Router';
import styled from '@emotion/styled';

import {MEMBER_ROLES} from 'app/constants';
import {AccessRequest, Member, Organization, Team} from 'app/types';
import {addErrorMessage, addSuccessMessage} from 'app/actionCreators/indicator';
import {Panel, PanelBody, PanelHeader} from 'app/components/panels';
import {t, tct} from 'app/locale';
import {trackAnalyticsEvent} from 'app/utils/analytics';
import EmptyMessage from 'app/views/settings/components/emptyMessage';
import withOrganization from 'app/utils/withOrganization';
import withTeams from 'app/utils/withTeams';
import AsyncView from 'app/views/asyncView';

import InviteRequestRow from './inviteRequestRow';
import OrganizationAccessRequests from './organizationAccessRequests';

import space from 'app/styles/space';
import Button from 'app/components/button';
import {IconCheckmark, IconChevron} from 'app/icons';
import theme from 'app/utils/theme';
import DropdownMenu from 'app/components/dropdownMenu';
import {css} from '@emotion/core';

type Props = {
  organization: Organization;
  requestList: AccessRequest[];
  inviteRequests: Member[];
  teams: Team[];
  onUpdateInviteRequest: (id: string, data: Partial<Member>) => void;
  onRemoveInviteRequest: (id: string) => void;
  onRemoveAccessRequest: (id: string) => void;
  showInviteRequests: boolean;
} & RouteComponentProps<{orgId: string}, {}>;

type State = AsyncView['state'] & {
  inviteRequestBusy: {[key: string]: boolean};
};

class OrganizationRequestsView extends AsyncView<Props, State> {
  static propTypes = {
    requestList: PropTypes.array.isRequired,
    inviteRequests: PropTypes.array.isRequired,
    onRemoveInviteRequest: PropTypes.func.isRequired,
    onRemoveAccessRequest: PropTypes.func.isRequired,
    showInviteRequests: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    inviteRequests: [],
  };

  getDefaultState() {
    const state = super.getDefaultState();
    return {
      ...state,
      inviteRequestBusy: {},
    };
  }

  UNSAFE_componentWillMount() {
    super.UNSAFE_componentWillMount();
    this.handleRedirect();
  }

  componentDidUpdate() {
    this.handleRedirect();
  }

  getEndpoints(): [string, string][] {
    const orgId = this.props.organization.slug;

    return [['member', `/organizations/${orgId}/members/me/`]];
  }

  handleRedirect() {
    const {router, params, requestList, showInviteRequests} = this.props;

    // redirect to the members view if the user cannot see
    // the invite requests panel and all of the team requests
    // have been approved or denied
    if (showInviteRequests || requestList.length) {
      return null;
    }
    return router.push(`/settings/${params.orgId}/members/`);
  }

  handleAction = async ({
    inviteRequest,
    method,
    data,
    successMessage,
    errorMessage,
    eventKey,
    eventName,
  }) => {
    const {params, organization, onRemoveInviteRequest} = this.props;

    this.setState(state => ({
      inviteRequestBusy: {...state.inviteRequestBusy, [inviteRequest.id]: true},
    }));

    try {
      await this.api.requestPromise(
        `/organizations/${params.orgId}/invite-requests/${inviteRequest.id}/`,
        {
          method,
          data,
        }
      );

      onRemoveInviteRequest(inviteRequest.id);
      addSuccessMessage(successMessage);
      trackAnalyticsEvent({
        eventKey,
        eventName,
        organization_id: organization.id,
        member_id: parseInt(inviteRequest.id, 10),
        invite_status: inviteRequest.inviteStatus,
      });
    } catch {
      addErrorMessage(errorMessage);
    }

    this.setState(state => ({
      inviteRequestBusy: {...state.inviteRequestBusy, [inviteRequest.id]: false},
    }));
  };

  handleApprove = (inviteRequest: Member) => {
    this.handleAction({
      inviteRequest,
      method: 'PUT',
      data: {
        role: inviteRequest.role,
        teams: inviteRequest.teams,
        approve: 1,
      },
      successMessage: tct('[email] has been invited', {email: inviteRequest.email}),
      errorMessage: tct('Error inviting [email]', {email: inviteRequest.email}),
      eventKey: 'invite_request.approved',
      eventName: 'Invite Request Approved',
    });
  };

  handleDeny = (inviteRequest: Member) => {
    this.handleAction({
      inviteRequest,
      method: 'DELETE',
      data: {},
      successMessage: tct('Invite request for [email] denied', {
        email: inviteRequest.email,
      }),
      errorMessage: tct('Error denying invite request for [email]', {
        email: inviteRequest.email,
      }),
      eventKey: 'invite_request.denied',
      eventName: 'Invite Request Denied',
    });
  };

  render() {
    const {
      params,
      requestList,
      showInviteRequests,
      inviteRequests,
      onRemoveAccessRequest,
      onUpdateInviteRequest,
      organization,
      teams,
    } = this.props;
    const {inviteRequestBusy, member} = this.state;

    return (
      <React.Fragment>
        {showInviteRequests && (
          <Panel>
            <PanelHeader>{t('Pending Invite Requests')}</PanelHeader>
            <PanelBody>
              {inviteRequests.map(inviteRequest => (
                <InviteRequestRow
                  key={inviteRequest.id}
                  organization={organization}
                  inviteRequest={inviteRequest}
                  inviteRequestBusy={inviteRequestBusy}
                  allTeams={teams}
                  allRoles={member ? member.roles : MEMBER_ROLES}
                  onApprove={this.handleApprove}
                  onDeny={this.handleDeny}
                  onUpdate={data => onUpdateInviteRequest(inviteRequest.id, data)}
                />
              ))}
              {inviteRequests.length === 0 && (
                <EmptyMessage>{t('No requests found.')}</EmptyMessage>
              )}
            </PanelBody>
          </Panel>
        )}

        <OrganizationAccessRequests
          orgId={params.orgId}
          requestList={requestList}
          onRemoveAccessRequest={onRemoveAccessRequest}
        />
        <PricingInterstitial />
      </React.Fragment>
    );
  }
}

const PricingInterstitial = () => (
  <Container>
    <PriceCard
      name={t('Business')}
      mode="monthly"
      featureList={[
        'Real-time error tracking',
        'Intelligent deduplication',
        'Support for every language',
      ]}
    />
    <PriceCard
      name={t('Team')}
      mode="monthly"
      featureList={[
        'Third-party integrations',
        'Commit and deploy tracking',
        'On-demand events',
      ]}
    />
    <PriceCard
      name={t('Developer')}
      mode="monthly"
      featureList={[
        'Third-party integrations',
        'Commit and deploy tracking',
        'On-demand events',
        'Advanced analytics',
        'SAML Single Sign-on',
        'Data volume controls',
      ]}
    />
  </Container>
);

type PriceCardProps = {
  name: string;
  mode: string;
  featureList: string[];
};

const MODES = {
  monthly: {subtext: 'mo', selectorText: t('Monthly event volume')},
  yearly: {subtext: 'yr', selectorText: t('Yearly event volume')},
};

class PriceCard extends React.Component<PriceCardProps> {
  defaultProps = {
    mode: 'monthly',
  };

  render() {
    const {name, mode, featureList} = this.props;
    const modeText = MODES[mode];
    const price = 0;

    return (
      <CardBackplate>
        <h2>{name}</h2>
        <small>{price === 0 ? t('Free') : t('Starts at')}</small>
        <Price subtext={modeText.subtext}>{price}</Price>
        <EventVolumeSelector text={modeText.selectorText} />

        <Button size="small" priority="primary">
          Start Free Trial
        </Button>
        <FeatureList>
          {featureList.map((f, i) => (
            <FeatureItem key={i}>{f}</FeatureItem>
          ))}
        </FeatureList>
      </CardBackplate>
    );
  }
}

const Price = styled(({subtext, children, ...props}) => (
  <div {...props}>
    <Currency />
    <Ammount>{children}</Ammount>
    <Subtext>/{subtext}</Subtext>
  </div>
))`
  display: grid;
  grid-gap: ${space(0.75)};
  padding: ${space(0.25)} 0;
  grid-template-columns: 1fr max-content 1fr;
`;

const Currency = styled(p => <span {...p}>$</span>)`
  font-size: 2.5rem;
  align-self: start;
  justify-self: right;
`;

const Ammount = styled('span')`
  font-size: 6rem;
  line-height: 0.75;
`;

const Subtext = styled('span')`
  font-size: 2rem;
  align-self: end;
  justify-self: left;
`;

const FeatureList = styled('ul')`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled(({children, ...p}) => (
  <li {...p}>
    <IconCheckmark color={theme.green} size="sm" />
    {children}
  </li>
))`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-gap: ${space(1)};
  margin-top: ${space(3)};
`;

const EventVolumeSelector = styled(({text, className, ...props}) => (
  <div className={className}>
    <EventVolumeText>{text}</EventVolumeText>
    <DropdownMenu>
      {({isOpen, getRootProps, getActorProps, getMenuProps}) => (
        <div {...getRootProps()}>
          <EventVolumeDropdownTarget isOpen={isOpen} {...getActorProps({})}>
            100k
            <IconChevron size="0.8rem" direction="down" />
          </EventVolumeDropdownTarget>

          {isOpen && (
            <ul {...getMenuProps({})}>
              <li>200k</li>
            </ul>
          )}
        </div>
      )}
    </DropdownMenu>
  </div>
))`
  display: grid;
  grid-template-columns: 1fr max-content;
  margin: ${space(2)} auto;
  grid-gap: ${space(1)};
  align-items: center;
`;

const EventVolumeText = styled('div')`
  color: ${p => p.theme.gray2};
`;

const EventVolumeDropdownTarget = styled('div')`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${p => p.theme.gray4};
  background: ${p => p.theme.offWhite2};
  border-radius: 3px;
  padding: ${space(0.25)} ${space(0.5)};
  display: grid;
  grid-template-columns: 1fr max-content;
  grid-gap: ${space(0.5)};
  align-items: center;
  ${p =>
    p.isOpen &&
    css`
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    `};
`;

const CardBackplate = styled('div')`
  background: ${p => p.theme.white};
  border: 1px solid ${p => p.theme.borderLighter};
  border-radius: ${p => p.theme.borderRadius};
  box-shadow: ${p => p.theme.dropShadowLightest};
  padding: ${space(3)};
  display: grid;
  grid-auto-rows: max-content;
  grid-gap: ${space(1)};
  font-size: 1.5rem;

  h2 {
    font-size: 2.5rem;
    font-weight: normal;
    text-align: center;
    margin: 0;
  }

  small {
    color: ${p => p.theme.gray2};
    text-align: center;
  }
`;

const Container = styled('div')`
  display: grid;
  grid-template-columns: repeat(3, 310px);
  grid-gap: ${space(2)};
`;

export default withTeams(withOrganization(OrganizationRequestsView));
