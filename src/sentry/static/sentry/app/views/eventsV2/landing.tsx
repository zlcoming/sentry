import {Params} from 'react-router/lib/Router';
import PropTypes from 'prop-types';
import React from 'react';
import * as ReactRouter from 'react-router';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import styled from '@emotion/styled';
import {Location} from 'history';

import {Organization, SavedQuery, SelectValue} from 'sentry/types';
import {PageContent} from 'sentry/styles/organization';
import {t} from 'sentry/locale';
import {trackAnalyticsEvent} from 'sentry/utils/analytics';
import Alert from 'sentry/components/alert';
import AsyncComponent from 'sentry/components/asyncComponent';
import Banner from 'sentry/components/banner';
import Button from 'sentry/components/button';
import DropdownControl, {DropdownItem} from 'sentry/components/dropdownControl';
import ConfigStore from 'sentry/stores/configStore';
import Feature from 'sentry/components/acl/feature';
import LightWeightNoProjectMessage from 'sentry/components/lightWeightNoProjectMessage';
import SearchBar from 'sentry/components/searchBar';
import SentryDocumentTitle from 'sentry/components/sentryDocumentTitle';
import SentryTypes from 'sentry/sentryTypes';
import localStorage from 'sentry/utils/localStorage';
import space from 'sentry/styles/space';
import withOrganization from 'sentry/utils/withOrganization';
import EventView from 'sentry/utils/discover/eventView';
import {decodeScalar} from 'sentry/utils/queryString';
import theme from 'sentry/utils/theme';

import {DEFAULT_EVENT_VIEW} from './data';
import {getPrebuiltQueries} from './utils';
import QueryList from './queryList';
import BackgroundSpace from './backgroundSpace';

const BANNER_DISMISSED_KEY = 'discover-banner-dismissed';

const SORT_OPTIONS: SelectValue<string>[] = [
  {label: t('Recently Edited'), value: '-dateUpdated'},
  {label: t('My Queries'), value: 'myqueries'},
  {label: t('Query Name (A-Z)'), value: 'name'},
  {label: t('Date Created (Newest)'), value: '-dateCreated'},
  {label: t('Date Created (Oldest)'), value: 'dateCreated'},
  {label: t('Most Outdated'), value: 'dateUpdated'},
];

function checkIsBannerHidden(): boolean {
  return localStorage.getItem(BANNER_DISMISSED_KEY) === 'true';
}

type Props = {
  organization: Organization;
  location: Location;
  router: ReactRouter.InjectedRouter;
  params: Params;
} & AsyncComponent['props'];

type State = {
  isBannerHidden: boolean;
  isSmallBanner: boolean;
  savedQueries: SavedQuery[];
  savedQueriesPageLinks: string;
} & AsyncComponent['state'];

class DiscoverLanding extends AsyncComponent<Props, State> {
  static propTypes: any = {
    organization: SentryTypes.Organization.isRequired,
    location: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
  };

  mq = window.matchMedia?.(`(max-width: ${theme.breakpoints[1]})`);

  state: State = {
    // AsyncComponent state
    loading: true,
    reloading: false,
    error: false,
    errors: [],

    // local component state
    isBannerHidden: checkIsBannerHidden(),
    isSmallBanner: this.mq?.matches,
    savedQueries: [],
    savedQueriesPageLinks: '',
  };

  componentDidMount() {
    if (this.mq) {
      this.mq.addListener(this.handleMediaQueryChange);
    }
  }

  componentWillUnmount() {
    if (this.mq) {
      this.mq.removeListener(this.handleMediaQueryChange);
    }
  }

  handleMediaQueryChange = (changed: MediaQueryListEvent) => {
    this.setState({
      isSmallBanner: changed.matches,
    });
  };

  shouldReload = true;

  getSavedQuerySearchQuery(): string {
    const {location} = this.props;

    return String(decodeScalar(location.query.query) || '').trim();
  }

  getActiveSort() {
    const {location} = this.props;

    const urlSort = location.query.sort
      ? decodeScalar(location.query.sort)
      : '-dateUpdated';
    return SORT_OPTIONS.find(item => item.value === urlSort) || SORT_OPTIONS[0];
  }

  getEndpoints(): [string, string, any][] {
    const {organization, location} = this.props;

    const views = getPrebuiltQueries(organization);
    const searchQuery = this.getSavedQuerySearchQuery();

    const cursor = decodeScalar(location.query.cursor);
    let perPage = 9;
    if (!cursor) {
      // invariant: we're on the first page

      if (searchQuery && searchQuery.length > 0) {
        const needleSearch = searchQuery.toLowerCase();

        const numOfPrebuiltQueries = views.reduce((sum, view) => {
          const eventView = EventView.fromNewQueryWithLocation(view, location);

          // if a search is performed on the list of queries, we filter
          // on the pre-built queries
          if (eventView.name && eventView.name.toLowerCase().includes(needleSearch)) {
            return sum + 1;
          }

          return sum;
        }, 0);

        perPage = Math.max(1, perPage - numOfPrebuiltQueries);
      } else {
        perPage = Math.max(1, perPage - views.length);
      }
    }

    const queryParams = {
      cursor,
      query: `version:2 name:"${searchQuery}"`,
      per_page: perPage,
      sortBy: this.getActiveSort().value,
    };
    if (!cursor) {
      delete queryParams.cursor;
    }

    return [
      [
        'savedQueries',
        `/organizations/${organization.slug}/discover/saved/`,
        {
          query: queryParams,
        },
      ],
    ];
  }

  componentDidUpdate(prevProps: Props) {
    const isBannerHidden = checkIsBannerHidden();
    if (isBannerHidden !== this.state.isBannerHidden) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        isBannerHidden,
      });
    }

    const PAYLOAD_KEYS = ['sort', 'cursor', 'query'] as const;

    const payloadKeysChanged = !isEqual(
      pick(prevProps.location.query, PAYLOAD_KEYS),
      pick(this.props.location.query, PAYLOAD_KEYS)
    );

    // if any of the query strings relevant for the payload has changed,
    // we re-fetch data
    if (payloadKeysChanged) {
      this.fetchData();
    }
  }

  handleQueryChange = () => {
    this.fetchData({reloading: true});
  };

  handleClick = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    this.setState({isBannerHidden: true});
  };

  handleSearchQuery = (searchQuery: string) => {
    const {location} = this.props;
    ReactRouter.browserHistory.push({
      pathname: location.pathname,
      query: {
        ...location.query,
        cursor: undefined,
        query: String(searchQuery).trim() || undefined,
      },
    });
  };

  handleSortChange = (value: string) => {
    const {location} = this.props;
    ReactRouter.browserHistory.push({
      pathname: location.pathname,
      query: {
        ...location.query,
        cursor: undefined,
        sort: value,
      },
    });
  };

  renderBanner() {
    const bannerDismissed = this.state.isBannerHidden;

    if (bannerDismissed) {
      return null;
    }

    const {location, organization} = this.props;
    const eventView = EventView.fromNewQueryWithLocation(DEFAULT_EVENT_VIEW, location);
    const to = eventView.getResultsViewUrlTarget(organization.slug);

    return (
      <StyledBanner
        title={t('Discover Trends')}
        subtitle={t(
          'Customize and save queries by search conditions, event fields, and tags'
        )}
        backgroundComponent={<BackgroundSpace />}
        onCloseClick={this.handleClick}
      >
        <StarterButton
          size={this.state.isSmallBanner ? 'xsmall' : undefined}
          to={to}
          onClick={() => {
            trackAnalyticsEvent({
              eventKey: 'discover_v2.build_new_query',
              eventName: 'Discoverv2: Build a new Discover Query',
              organization_id: parseInt(this.props.organization.id, 10),
            });
          }}
        >
          {t('Build a new query')}
        </StarterButton>
        <StarterButton
          size={this.state.isSmallBanner ? 'xsmall' : undefined}
          href="https://docs.sentry.io/performance-monitoring/discover-queries/"
        >
          {t('Read the docs')}
        </StarterButton>
      </StyledBanner>
    );
  }

  renderActions() {
    const activeSort = this.getActiveSort();

    return (
      <StyledActions>
        <StyledSearchBar
          defaultQuery=""
          query={this.getSavedQuerySearchQuery()}
          placeholder={t('Search saved queries')}
          onSearch={this.handleSearchQuery}
        />
        <DropdownControl buttonProps={{prefix: t('Sort By')}} label={activeSort.label}>
          {SORT_OPTIONS.map(({label, value}) => (
            <DropdownItem
              key={value}
              onSelect={this.handleSortChange}
              eventKey={value}
              isActive={value === activeSort.value}
            >
              {label}
            </DropdownItem>
          ))}
        </DropdownControl>
      </StyledActions>
    );
  }

  onGoLegacyDiscover = () => {
    localStorage.setItem('discover:version', '1');
    const user = ConfigStore.get('user');
    trackAnalyticsEvent({
      eventKey: 'discover_v2.opt_out',
      eventName: 'Discoverv2: Go to discover',
      organization_id: parseInt(this.props.organization.id, 10),
      user_id: parseInt(user.id, 10),
    });
  };

  renderNoAccess() {
    return (
      <PageContent>
        <Alert type="warning">{t("You don't have access to this feature")}</Alert>
      </PageContent>
    );
  }

  renderBody() {
    const {location, organization} = this.props;
    const {savedQueries, savedQueriesPageLinks} = this.state;

    return (
      <QueryList
        pageLinks={savedQueriesPageLinks}
        savedQueries={savedQueries}
        savedQuerySearchQuery={this.getSavedQuerySearchQuery()}
        location={location}
        organization={organization}
        onQueryChange={this.handleQueryChange}
      />
    );
  }

  render() {
    const {location, organization} = this.props;
    const eventView = EventView.fromNewQueryWithLocation(DEFAULT_EVENT_VIEW, location);
    const to = eventView.getResultsViewUrlTarget(organization.slug);

    return (
      <Feature
        organization={organization}
        features={['discover-query']}
        renderDisabled={this.renderNoAccess}
      >
        <SentryDocumentTitle title={t('Discover')} objSlug={organization.slug}>
          <StyledPageContent>
            <LightWeightNoProjectMessage organization={organization}>
              <PageContent>
                <StyledPageHeader>
                  {t('Discover')}
                  <StyledButton
                    data-test-id="build-new-query"
                    to={to}
                    priority="primary"
                    onClick={() => {
                      trackAnalyticsEvent({
                        eventKey: 'discover_v2.build_new_query',
                        eventName: 'Discoverv2: Build a new Discover Query',
                        organization_id: parseInt(this.props.organization.id, 10),
                      });
                    }}
                  >
                    {t('Build a new query')}
                  </StyledButton>
                </StyledPageHeader>
                {this.renderBanner()}
                {this.renderActions()}
                {this.renderComponent()}
              </PageContent>
            </LightWeightNoProjectMessage>
          </StyledPageContent>
        </SentryDocumentTitle>
      </Feature>
    );
  }
}

const StyledPageContent = styled(PageContent)`
  padding: 0;
`;

export const StyledPageHeader = styled('div')`
  display: flex;
  align-items: flex-end;
  font-size: ${p => p.theme.headerFontSize};
  color: ${p => p.theme.gray800};
  justify-content: space-between;
  margin-bottom: ${space(2)};
`;

const StyledSearchBar = styled(SearchBar)`
  flex-grow: 1;
`;

const StyledActions = styled('div')`
  display: grid;
  grid-gap: ${space(2)};
  grid-template-columns: auto min-content;

  align-items: center;
  margin-bottom: ${space(3)};
`;

const StyledButton = styled(Button)`
  white-space: nowrap;
`;

const StarterButton = styled(Button)`
  margin: ${space(1)};
`;

const StyledBanner = styled(Banner)`
  max-height: 220px;

  @media (min-width: ${p => p.theme.breakpoints[3]}) {
    max-height: 260px;
  }
`;

export default withOrganization(DiscoverLanding);
export {DiscoverLanding};
