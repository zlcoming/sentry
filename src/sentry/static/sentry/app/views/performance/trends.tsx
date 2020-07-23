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

import {RadioLineItem} from '../settings/components/forms/controls/radioGroup';
import DurationChart from './transactionSummary/durationChart';
import {TrendField} from './landing';

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

enum TrendType {
  IMPROVED = 'improved',
  REGRESSION = 'regression',
}

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

enum TransactionColors {
  RED = '#FA4747', // TODO: Replace with theme in radio override
  GREEN = '#4DC771',
}

type TrendsQueryWrapperProps = Props & {
  chartTitle: string;
  titleTooltipContent: string;
  trendType: TrendType;
};

function TrendsQueryWrapper(props: TrendsQueryWrapperProps) {
  const {eventView, organization, location, trendType} = props;
  return (
    <Panel>
      <DiscoverQuery
        eventView={eventView}
        orgSlug={organization.slug}
        location={location}
        trendsEndpoint
        isWorstTrends={trendType === TrendType.REGRESSION}
      >
        {({isLoading, eventTrendsData}) => (
          <TrendChartTable
            isLoading={isLoading}
            eventTrendsData={eventTrendsData}
            {...props}
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
};

class TrendChartTable extends React.Component<
  TrendsChartTableProps,
  TrendsChartTableState
> {
  state: TrendsChartTableState = {};

  componentDidUpdate(prevProps: TrendsChartTableProps) {
    if (prevProps.eventTrendsData !== this.props.eventTrendsData) {
      // TODO: Double check a way to fix selection on reload of data
      this.updateSelectedTransaction(this.props.eventTrendsData?.[0]);
    }
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

  render() {
    const {
      eventTrendsData,
      trendType,
      isLoading,
      organization,
      eventView,
      chartTitle,
      titleTooltipContent,
      currentTrendField,
    } = this.props;
    const {selectedTransaction} = this.state;
    return (
      <React.Fragment>
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
            useLineChart
          />
        </DurationContainer>
        {eventTrendsData ? (
          <TrendsTransactionList
            trendType={trendType}
            selectedTransaction={selectedTransaction}
            isLoading={isLoading}
            data={eventTrendsData}
            handleChangeTransaction={this.handleChangeTransaction}
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

type TransactionListProps = {
  isLoading: boolean;
  data: TrendsTransaction[];
  selectedTransaction?: TrendsTransaction;
  trendType: TrendType;
  handleChangeTransaction: Function;
};

function TrendsTransactionList(props: TransactionListProps) {
  const {data, trendType, selectedTransaction, handleChangeTransaction} = props;

  return (
    <div>
      {data.map((transaction, index) => (
        <TransactionItem
          trendType={trendType}
          selected={transaction === selectedTransaction}
          key={index}
          index={index}
          transaction={transaction}
          handleChangeTransaction={handleChangeTransaction}
        />
      ))}
    </div>
  );
}

export type TrendsTransaction = {
  transaction: string;
  delta: number;
  percentage: number;
  aggregateRange_1: number;
  aggregateRange_2: number;
};

type TransactionItemProps = {
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
        <Duration seconds={seconds} abbreviation />
        <span>&nbsp;{suffix}</span>
      </span>
    );
  }
  return `${getAbsoluteSecondsString(Math.abs(milliseconds))} ${suffix}`;
}

const trendToColor = {
  [TrendType.IMPROVED]: TransactionColors.GREEN,
  [TrendType.REGRESSION]: TransactionColors.RED,
};

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
            <span>{transaction.transaction}</span>
          </ItemTransactionName>
          <ItemTransactionAbsoluteFaster>
            {getAbsoluteSecondsString(transaction.aggregateRange_1)}
            &nbsp;→&nbsp;
            {getAbsoluteSecondsString(transaction.aggregateRange_2)}
          </ItemTransactionAbsoluteFaster>
        </ItemTransactionNameContainer>
        <ItemTransactionPercentContainer>
          <ItemTransactionPercent>
            {(transaction.percentage * 100).toFixed(0)}%
          </ItemTransactionPercent>
          <ItemTransactionPercentFaster color={color}>
            {transformDelta(transaction.delta, trendType)}
          </ItemTransactionPercentFaster>
        </ItemTransactionPercentContainer>
      </ItemSplit>
    </StyledItem>
  );
}

const radioColorMap = {
  [TransactionColors.GREEN]: '#4DC771', // TODO: Check theme colors
  [TransactionColors.RED]: '#FA4747', // TODO: Check theme colors
};

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
  flex-direction: row;
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

const ItemTransactionName = styled('div')`
  color: ${p => p.theme.blue400};
`;
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
  padding: ${space(4)} ${space(2)};
`;

// TODO: Check calc hack
const PageContainer = styled('div')`
  display: grid;
  column-gap: ${space(2)};
  width: calc(100% - ${space(2)});
  grid-template-columns: 50% 50%;
`;

export default Trends;
