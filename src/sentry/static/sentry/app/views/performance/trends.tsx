import React from 'react';
import {Location} from 'history';
import styled from '@emotion/styled';

import {Organization, Project} from 'app/types';
import {Panel} from 'app/components/panels';
import EventView, {EventData} from 'app/utils/discover/eventView';
import DiscoverQuery, {EventTrendsData} from 'app/utils/discover/discoverQuery';
import space from 'app/styles/space';
import EmptyStateWarning from 'app/components/emptyStateWarning';
import Radio from 'app/components/radio';
import LoadingIndicator from 'app/components/loadingIndicator';
import {t} from 'app/locale';
import Duration from 'app/components/duration';
import {
  getDiffInMinutes,
  THIRTY_DAYS,
  TWENTY_FOUR_HOURS,
  ONE_HOUR,
  DateTimeObject,
  ONE_WEEK,
  TWO_WEEKS,
} from 'app/components/charts/utils';
import Link from 'app/components/links/link';
import {Field} from 'app/utils/discover/fields';
import {HeaderTitle} from 'app/styles/organization';
import QuestionTooltip from 'app/components/questionTooltip';
import localStorage from 'app/utils/localStorage';
import theme from 'app/utils/theme';

import {RadioLineItem} from '../settings/components/forms/controls/radioGroup';
import DurationChart from './transactionSummary/durationChart';
import {TrendField, TRENDS_FIELDS} from './landing';
import {transactionSummaryRouteWithQuery} from './transactionSummary/utils';
import {HeaderContainer} from './styles';

const DEFAULT_COUNT_RATIO_THRESHOLD = 2;
const THRESHOLD_STORAGE_KEY = 'trends:event-count-ratio-threshold';
const THRESHOLD_ABSOLUTE_STORAGE_KEY = 'trends:event-count-ratio-absolute-threshold';

enum TrendType {
  IMPROVED = 'improved',
  REGRESSION = 'regression',
}

enum TransactionColors {
  RED = '#FA4747', // TODO: Replace with theme in radio override
  GREEN = '#4DC771',
}

const trendToColor = {
  [TrendType.IMPROVED]: TransactionColors.GREEN,
  [TrendType.REGRESSION]: TransactionColors.RED,
};

const radioColorMap = {
  [TransactionColors.GREEN]: '#4DC771', // TODO: Check theme colors
  [TransactionColors.RED]: '#FA4747', // TODO: Check theme colors
};

export function getProjectID(
  eventData: EventData,
  projects: Project[]
): string | undefined {
  const projectSlug = (eventData?.project as string) || undefined;

  if (typeof projectSlug === undefined) {
    return undefined;
  }

  const project = projects.find(currentProject => currentProject.slug === projectSlug);

  if (!project) {
    return undefined;
  }

  return project.id;
}

type Props = {
  eventView: EventView;
  organization: Organization;
  location: Location;
  setError: (msg: string | undefined) => void;
  keyTransactions: boolean;
  summaryConditions: string;
  currentTrendField: TrendField;
  projects: Project[];
};

type State = {
  widths: number[];
};

class Trends extends React.Component<Props, State> {
  render() {
    const tooltipContent = 'test content'; // TODO: Update

    return (
      <PageContainer>
        <TrendsQueryWrapper
          chartTitle="Most Improved"
          titleTooltipContent={tooltipContent}
          trendType={TrendType.IMPROVED}
          {...this.props}
        />
        <TrendsQueryWrapper
          chartTitle="Worst Regressions"
          titleTooltipContent={tooltipContent}
          trendType={TrendType.REGRESSION}
          {...this.props}
        />
      </PageContainer>
    );
  }
}

type TrendsQueryWrapperProps = Props & {
  chartTitle: string;
  titleTooltipContent: string;
  trendType: TrendType;
};

function TrendsQueryWrapper(props: TrendsQueryWrapperProps) {
  const {eventView, organization, location, trendType, currentTrendField} = props;
  const trendsView = eventView.clone(); // TODO: fix hack
  const additionalRequiredTrendFields = ['transaction', 'project', 'count()'];
  trendsView.fields = [
    ...additionalRequiredTrendFields.map(field => ({field})),
    ...TRENDS_FIELDS,
  ] as Readonly<Field[]>;

  return (
    <Panel>
      <DiscoverQuery
        eventView={trendsView}
        orgSlug={organization.slug}
        location={location}
        trendsEndpoint
        isWorstTrends={trendType === TrendType.REGRESSION}
        currentTrendField={currentTrendField}
      >
        {({isLoading, eventTrendsData}) => (
          <TrendChartTable
            isLoading={isLoading}
            eventTrendsData={eventTrendsData}
            {...props}
            eventView={trendsView}
          />
        )}
      </DiscoverQuery>
    </Panel>
  );
}

type TrendsChartTableProps = Props &
  TrendsQueryWrapperProps & {
    trendType: TrendType;
    eventTrendsData: EventTrendsData | null | undefined;
    isLoading: boolean;
  };

type TrendsChartTableState = {
  selectedTransaction?: TrendsTransaction;
  nestedTransactions?: NestedTransactions;
};

enum TrendTransactionGroup {
  EVENT_COUNT_DISPARITY,
  SPIKE_ANOMALY,
  NONE,
}

type NestedTransactionsGroup = {
  type: TrendTransactionGroup;
  transactions: TrendsTransaction[];
  visible: boolean;
};

type NestedTransactions = NestedTransactionsGroup[];

// TODO: Fix BE query to address this
function filterIncorrectTransactions(
  trendsTransactionData: TrendsTransaction[],
  trendType: TrendType
) {
  return trendsTransactionData.filter(
    txn =>
      txn.divide_aggregateRange_2_aggregateRange_1 !== 0 &&
      (trendType === TrendType.IMPROVED
        ? txn.divide_aggregateRange_2_aggregateRange_1 < 1
        : txn.divide_aggregateRange_2_aggregateRange_1 > 1)
  );
}

function analyzeTransaction(transaction: TrendsTransaction): TrendTransactionGroup {
  const _thresholdFromStorage = localStorage.getItem(THRESHOLD_STORAGE_KEY);
  const _absThresholdFromStorage = localStorage.getItem(THRESHOLD_ABSOLUTE_STORAGE_KEY);

  if (_absThresholdFromStorage) {
    const threshold = parseFloat(_absThresholdFromStorage);
    if (transaction.count_2 > threshold && transaction.count_1 > threshold) {
      return TrendTransactionGroup.EVENT_COUNT_DISPARITY;
    }
  } else {
    const threshold = _thresholdFromStorage
      ? parseFloat(_thresholdFromStorage)
      : DEFAULT_COUNT_RATIO_THRESHOLD;
    if (
      transaction.divide_count_2_count_1 > threshold ||
      transaction.divide_count_2_count_1 < 1 / threshold
    ) {
      return TrendTransactionGroup.EVENT_COUNT_DISPARITY;
    }
  }
  return TrendTransactionGroup.NONE;
}

function walkDataForGrouping(trendsTransactionData: TrendsTransaction[]) {
  const nestedTransaction: NestedTransactions = [];

  let countVisible = 0;
  let currentGroup: NestedTransactionsGroup | undefined;

  for (const transaction of trendsTransactionData) {
    const groupType = analyzeTransaction(transaction);
    const visible = groupType === TrendTransactionGroup.NONE;
    if (!currentGroup || groupType !== currentGroup.type) {
      currentGroup = {
        type: groupType,
        transactions: [transaction],
        visible,
      };
      nestedTransaction.push(currentGroup);
    } else {
      currentGroup.transactions.push(transaction);
    }

    transaction.groupType = groupType;

    if (visible) {
      countVisible++;
    }
    if (countVisible >= 5) {
      break;
    }
  }
  return {
    nestedTransaction,
    countVisible,
  };
}

function createNestedTransactions(
  trendsTransactionData: TrendsTransaction[],
  trendType: TrendType
): NestedTransactions {
  const data = filterIncorrectTransactions(trendsTransactionData, trendType);
  const {countVisible, nestedTransaction} = walkDataForGrouping(data);
  if (countVisible < 5) {
    return [
      {
        type: TrendTransactionGroup.NONE,
        transactions: data.slice(0, 5),
        visible: true,
      },
    ];
  }
  return nestedTransaction;
}

function getFirstVisibleNestedTransaction(nestedTransactions: NestedTransactions) {
  const visible = nestedTransactions.find(g => g.visible);
  return visible?.transactions[0];
}

class TrendChartTable extends React.Component<
  TrendsChartTableProps,
  TrendsChartTableState
> {
  state: TrendsChartTableState = {};

  componentDidUpdate(prevProps: TrendsChartTableProps) {
    if (prevProps.eventTrendsData !== this.props.eventTrendsData) {
      // TODO: Double check a way to fix selection on reload of data
      this.updateNestedTransactions(this.props.eventTrendsData);
    }
  }

  // TODO: Fix this rendering hack later
  handleUnhideGroup = (groupType: TrendTransactionGroup) => {
    const {nestedTransactions} = this.state;
    nestedTransactions?.forEach(group => {
      if (group.type === groupType) {
        group.visible = true;
      }
    });
    this.setState({
      nestedTransactions: [...nestedTransactions],
    });
  };

  updateNestedTransactions(data) {
    const nestedTransactions = createNestedTransactions(data, this.props.trendType);
    this.updateSelectedTransaction(getFirstVisibleNestedTransaction(nestedTransactions));

    this.setState({
      nestedTransactions,
    });
  }

  updateSelectedTransaction(transaction?: TrendsTransaction) {
    this.setState({
      selectedTransaction: transaction,
    });
  }

  handleChangeTransaction = (transaction: TrendsTransaction) => {
    this.updateSelectedTransaction(transaction);
  };

  chartIntervalFunction(dateTimeSelection: DateTimeObject) {
    const diffInMinutes = getDiffInMinutes(dateTimeSelection);
    if (diffInMinutes >= THIRTY_DAYS) {
      return '24h';
    }

    if (diffInMinutes >= TWO_WEEKS) {
      return '12h';
    }

    if (diffInMinutes >= ONE_WEEK) {
      return '6h';
    }

    if (diffInMinutes >= TWENTY_FOUR_HOURS) {
      return '30m';
    }

    if (diffInMinutes <= ONE_HOUR) {
      return '90s';
    }

    return '1m';
  }

  generateMidwayForChart() {
    return [
      {
        data: [],
        markLine: {
          data: [],
          label: {show: false},
          lineStyle: {
            normal: {
              color: theme.gray700,
              type: 'dashed',
              width: 2,
            },
          },
          symbol: ['none', 'none'],
          tooltip: {
            show: false,
          },
        },
        seriesName: 'Split',
      },
    ];
  }

  render() {
    const {
      eventTrendsData,
      isLoading,
      organization,
      eventView,
      chartTitle,
      titleTooltipContent,
      currentTrendField,
      trendType,
    } = this.props;
    const {selectedTransaction, nestedTransactions} = this.state;
    const color = trendToColor[trendType];
    const colorHex = radioColorMap[color];

    const midwayMark = this.generateMidwayForChart();

    return (
      <React.Fragment>
        <TrendsHeaderContainer>
          <div>
            <HeaderTitle>
              {chartTitle}{' '}
              <QuestionTooltip position="top" size="sm" title={titleTooltipContent} />
            </HeaderTitle>
          </div>
        </TrendsHeaderContainer>
        <DurationContainer>
          <DurationChart
            organization={organization}
            query={eventView.query}
            project={eventView.project}
            environment={eventView.environment}
            start={eventView.start}
            end={eventView.end}
            statsPeriod={eventView.statsPeriod}
            chartTitle={chartTitle}
            titleTooltipContent={titleTooltipContent}
            overrideYAxis={[currentTrendField.field]}
            intervalFunction={this.chartIntervalFunction}
            scopedTransaction={selectedTransaction}
            forceLineColor={colorHex}
            additionalSeries={midwayMark}
            useLineChart
            hideTitle
          />
        </DurationContainer>
        {eventTrendsData && eventTrendsData.length ? (
          <TrendsTransactionList
            selectedTransaction={selectedTransaction}
            data={eventTrendsData}
            handleChangeTransaction={this.handleChangeTransaction}
            nestedTransactions={nestedTransactions}
            handleUnhideGroup={this.handleUnhideGroup}
            {...this.props}
          />
        ) : (
          <EmptyTransactionList>
            {isLoading ? (
              <LoadingIndicator />
            ) : (
              <EmptyStateWarning>
                <p>{t('No results found')}</p>
              </EmptyStateWarning>
            )}
          </EmptyTransactionList>
        )}
      </React.Fragment>
    );
  }
}

type TransactionListProps = TrendsChartTableProps & {
  isLoading: boolean;
  data: TrendsTransaction[];
  selectedTransaction?: TrendsTransaction;
  trendType: TrendType;
  handleChangeTransaction: Function;
  nestedTransactions?: NestedTransactions;
  handleUnhideGroup: Function;
};

function TrendsTransactionList(props: TransactionListProps) {
  const {selectedTransaction, nestedTransactions, handleUnhideGroup} = props;
  let eventDisparityItems: TrendsTransaction[] = [];

  if (nestedTransactions) {
    eventDisparityItems = ([] as TrendsTransaction[]).concat(
      ...nestedTransactions
        .filter(
          txn => !txn.visible && txn.type === TrendTransactionGroup.EVENT_COUNT_DISPARITY
        )
        .map(txn => txn.transactions)
    );
  }

  const eventDisparityCount = eventDisparityItems.length;

  const visibleTransactions = nestedTransactions
    ? nestedTransactions.filter(txn => txn.visible)
    : [];

  const expandedTransactions: TrendsTransaction[] = ([] as TrendsTransaction[])
    .concat(...visibleTransactions.map(txn => txn.transactions))
    .slice(0, 5);

  return (
    <div>
      {expandedTransactions.map((transaction, index) => (
        <TransactionItem
          selected={transaction === selectedTransaction}
          key={index}
          index={index}
          transaction={transaction}
          {...props}
        />
      ))}
      <NotShown>
        {eventDisparityCount > 0 && (
          <ExpandGroupContainer>
            <ExpandGroup>
              <strong>{eventDisparityCount}</strong> Transactions with throughput changes
              more than X have been hidden.{' '}
              <ExpandShowAll
                onClick={() =>
                  handleUnhideGroup(TrendTransactionGroup.EVENT_COUNT_DISPARITY)
                }
              >
                Show all
              </ExpandShowAll>
            </ExpandGroup>
          </ExpandGroupContainer>
        )}
      </NotShown>
    </div>
  );
}

export type TrendsTransaction = {
  transaction: string;
  divide_aggregateRange_2_aggregateRange_1: number;
  minus_aggregateRange_2_aggregateRange_1: number;
  count: number;
  project: string;
  aggregateRange_1: number;
  aggregateRange_2: number;
  p99?: number;
  p95?: number;
  p75?: number;
  p50?: number;
  user_misery_300?: number;
  apdex_300?: number;
  count_1: number;
  count_2: number;
  divide_count_2_count_1: number;

  // TODO: The following shouldn't be on here as they aren't from the API
  groupType?: TrendTransactionGroup;
};

type TransactionItemProps = TransactionListProps & {
  selected: boolean;
  index: number;
  transaction: TrendsTransaction;
  trendType: TrendType;
  handleChangeTransaction: Function;
};

function getAbsoluteSecondsString(milliseconds) {
  return `${(Math.round(milliseconds / 100) / 10).toFixed(1)}s`; // TODO: Replace function with more generic ms / s
}

function transformDelta(milliseconds, trendType) {
  let suffix = 'faster';
  if (trendType === TrendType.REGRESSION) {
    suffix = 'slower';
  }

  const seconds = Math.abs(milliseconds) / 1000;

  if (seconds < 0.1) {
    return (
      <span>
        <Duration seconds={seconds} abbreviation /> {suffix}
      </span>
    );
  }
  return `${getAbsoluteSecondsString(Math.abs(milliseconds))} ${suffix}`;
}

function TransactionItem(props: TransactionItemProps) {
  const {index, selected, trendType, transaction, handleChangeTransaction} = props;
  const color = trendToColor[trendType];
  // TODO: Re-add Aria labels (see RadioGroup)
  return (
    <StyledItem>
      <ItemSplit>
        <ItemRadioContainer color={color}>
          <RadioLineItem role="radio" index={index}>
            <Radio
              checked={selected}
              onChange={() => handleChangeTransaction(transaction)}
            />
          </RadioLineItem>
        </ItemRadioContainer>
        <ItemTransactionNameContainer>
          <ItemTransactionName>
            <TransactionLink {...props} />
          </ItemTransactionName>
          <ItemTransactionAbsoluteFaster>
            {transaction.project}
          </ItemTransactionAbsoluteFaster>
        </ItemTransactionNameContainer>
        <ItemTransactionPercentContainer>
          <ItemTransactionPercent>
            {(transaction.divide_aggregateRange_2_aggregateRange_1 * 100).toFixed(0)}%
          </ItemTransactionPercent>
          <ItemTransactionPercentFaster color={color}>
            {transformDelta(
              transaction.minus_aggregateRange_2_aggregateRange_1,
              trendType
            )}
          </ItemTransactionPercentFaster>
        </ItemTransactionPercentContainer>
      </ItemSplit>
    </StyledItem>
  );
}

type TransactionLinkProps = TransactionItemProps & {};

const TransactionLink = (props: TransactionLinkProps) => {
  const {organization, eventView, transaction} = props;

  const summaryView = eventView.clone();
  const target = transactionSummaryRouteWithQuery({
    orgSlug: organization.slug,
    transaction: String(transaction.transaction) || '',
    query: summaryView.generateQueryStringObject(),
  });

  return <Link to={target}>{transaction.transaction}</Link>;
};

const TrendsHeaderContainer = styled(HeaderContainer)`
  padding-left: ${space(2)};
  padding-right: ${space(2)};
  padding-bottom: ${space(2)};
  padding-top: ${space(3)};
`;

// TODO: Check opacity
const EmptyTransactionList = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${space(1)};
  opacity: 0.5;
`;

const StyledItem = styled('div')`
  border-top: 1px solid ${p => p.theme.borderLight};
  padding: ${space(1)} ${space(2)};
`;

const ItemSplit = styled('div')`
  display: flex;
`;

// TODO: Confirm customized width/height over rem
const ItemRadioContainer = styled('div')`
  input:checked::after {
    background-color: ${p => p.color};
    width: 14px;
    height: 14px;
  }
`;
const ItemTransactionNameContainer = styled('div')`
  flex-grow: 1;
`;

const ItemTransactionName = styled('div')``;
const ItemTransactionAbsoluteFaster = styled('div')`
  color: ${p => p.theme.gray500};
  font-size: 14px;
`;

const ItemTransactionPercent = styled('div')``;
const ItemTransactionPercentFaster = styled('div')`
  color: ${p => radioColorMap[p.color || '']};
  font-size: 14px;
  white-space: nowrap;
`;
const ItemTransactionPercentContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const DurationContainer = styled('div')`
  padding: 0 ${space(2)};
  padding-bottom: ${space(4)};
`;

const ExpandGroupContainer = styled('div')`
  width: 100%;
  border-top: 1px solid ${p => p.theme.borderLight};
  background-color: ${p => p.theme.gray200};
  padding: ${space(1)} ${space(2)};
  font-size: 14px;
  margin-top: ${space(1)};
`;

const ExpandGroup = styled('div')`
  color: ${p => p.theme.gray500};
`;

const ExpandShowAll = styled('span')`
  text-decoration: underline;
  cursor: pointer;
`;

// TODO: remove
const NotShown = styled('span')`
  display: none;
`;

// TODO: Check calc hack
const PageContainer = styled('div')`
  display: grid;
  column-gap: ${space(2)};
  width: calc(100% - ${space(2)});
  grid-template-columns: 50% 50%;
`;

export default Trends;
