import React from 'react';

import {t} from 'sentry/locale';
import {
  ChartControls,
  InlineContainer,
  SectionHeading,
  SectionValue,
} from 'sentry/components/charts/styles';
import OptionSelector from 'sentry/components/charts/optionSelector';
import styled from 'sentry/styled';
import space from 'sentry/styles/space';
import {SelectValue} from 'sentry/types';

export enum YAxis {
  SESSIONS = 'sessions',
  USERS = 'users',
  CRASH_FREE = 'crashFree',
  SESSION_DURATION = 'sessionDuration',
  EVENTS = 'events',
}

type Props = {
  summary: React.ReactNode;
  yAxis: YAxis;
  onYAxisChange: (value: YAxis) => void;
  hasHealthData: boolean;
  hasDiscover: boolean;
};

const ReleaseChartControls = ({
  summary,
  yAxis,
  onYAxisChange,
  hasHealthData,
  hasDiscover,
}: Props) => {
  const yAxisOptions: SelectValue<YAxis>[] = [];

  if (hasHealthData) {
    yAxisOptions.push(
      ...[
        {
          value: YAxis.SESSIONS,
          label: t('Session Count'),
        },
        {
          value: YAxis.SESSION_DURATION,
          label: t('Session Duration'),
        },
        {
          value: YAxis.USERS,
          label: t('User Count'),
        },
        {
          value: YAxis.CRASH_FREE,
          label: t('Crash Free Rate'),
        },
      ]
    );
  }

  if (hasDiscover) {
    yAxisOptions.push({
      value: YAxis.EVENTS,
      label: t('Event Count'),
    });
  }

  const getSummaryHeading = () => {
    switch (yAxis) {
      case YAxis.USERS:
        return t('Total Active Users');
      case YAxis.CRASH_FREE:
        return t('Average Rate');
      case YAxis.SESSION_DURATION:
        return t('Average Duration');
      case YAxis.EVENTS:
        return t('Total Events');
      case YAxis.SESSIONS:
      default:
        return t('Total Sessions');
    }
  };

  return (
    <StyledChartControls>
      <InlineContainer>
        <SectionHeading key="total-label">{getSummaryHeading()}</SectionHeading>
        <SectionValue key="total-value">{summary}</SectionValue>
      </InlineContainer>

      {yAxisOptions.length > 1 && (
        <OptionSelector
          title={t('Y-Axis')}
          selected={yAxis}
          options={yAxisOptions}
          onChange={onYAxisChange as (value: string) => void}
          menuWidth="150px"
        />
      )}
    </StyledChartControls>
  );
};

const StyledChartControls = styled(ChartControls)`
  @media (max-width: ${p => p.theme.breakpoints[0]}) {
    display: grid;
    grid-gap: ${space(1)};
    padding-bottom: ${space(1.5)};
    button {
      font-size: ${p => p.theme.fontSizeSmall};
    }
  }
`;

export default ReleaseChartControls;
