import PropTypes from 'prop-types';
import React from 'react';

import {Panel, PanelBody, PanelHeader} from 'sentry/components/panels';
import {intcomma} from 'sentry/utils';
import {t} from 'sentry/locale';
import LoadingError from 'sentry/components/loadingError';
import LoadingIndicator from 'sentry/components/loadingIndicator';
import Pagination from 'sentry/components/pagination';
import ProjectTable from 'sentry/views/organizationStats/projectTable';
import StackedBarChart from 'sentry/components/stackedBarChart';
import TextBlock from 'sentry/views/settings/components/text/textBlock';
import PageHeading from 'sentry/components/pageHeading';
import {
  ProjectTableLayout,
  ProjectTableDataElement,
} from 'sentry/views/organizationStats/projectTableLayout';
import {PageContent} from 'sentry/styles/organization';
import PerformanceAlert from 'sentry/views/organizationStats/performanceAlert';

class OrganizationStats extends React.Component {
  static propTypes = {
    statsLoading: PropTypes.bool,
    projectsLoading: PropTypes.bool,
    orgTotal: PropTypes.object,
    statsError: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    orgStats: PropTypes.array,
    projectTotals: PropTypes.array,
    projectMap: PropTypes.object,
    projectsError: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    pageLinks: PropTypes.string,
    organization: PropTypes.object,
  };

  renderTooltip(point, _pointIdx, chart) {
    const timeLabel = chart.getTimeLabel(point);
    const [accepted, rejected, blacklisted] = point.y;

    return (
      <div style={{width: '150px'}}>
        <div className="time-label">{timeLabel}</div>
        <div className="value-label">
          {intcomma(accepted)} accepted
          {rejected > 0 && (
            <React.Fragment>
              <br />
              {intcomma(rejected)} rate limited
            </React.Fragment>
          )}
          {blacklisted > 0 && (
            <React.Fragment>
              <br />
              {intcomma(blacklisted)} filtered
            </React.Fragment>
          )}
        </div>
      </div>
    );
  }

  renderContent() {
    const {
      statsLoading,
      orgTotal,
      statsError,
      orgStats,
      projectsLoading,
      projectTotals,
      projectMap,
      projectsError,
      pageLinks,
      organization,
    } = this.props;

    return (
      <div>
        <PageHeading withMargins>{t('Organization Stats')}</PageHeading>
        <div className="row">
          <div className="col-md-9">
            <TextBlock>
              {t(
                `The chart below reflects events the system has received
                across your entire organization. Events are broken down into
                three categories: Accepted, Rate Limited, and Filtered. Rate
                Limited events are entries that the system threw away due to quotas
                being hit, and Filtered events are events that were blocked
                due to your inbound data filter rules.`
              )}
            </TextBlock>
          </div>
          {!statsLoading && (
            <div className="col-md-3 stats-column">
              <h6 className="nav-header">{t('Events per minute')}</h6>
              <p className="count">{orgTotal.avgRate}</p>
            </div>
          )}
        </div>
        <div>
          <PerformanceAlert />
          {statsLoading ? (
            <LoadingIndicator />
          ) : statsError ? (
            <LoadingError onRetry={this.fetchData} />
          ) : (
            <Panel className="bar-chart">
              <StackedBarChart
                points={orgStats}
                height={150}
                label="events"
                className="standard-barchart b-a-0 m-b-0"
                barClasses={['accepted', 'rate-limited', 'black-listed']}
                minHeights={[2, 0, 0]}
                gap={0.25}
                tooltip={this.renderTooltip}
              />
            </Panel>
          )}
        </div>

        <Panel>
          <PanelHeader>
            <ProjectTableLayout>
              <div>{t('Project')}</div>
              <ProjectTableDataElement>{t('Accepted')}</ProjectTableDataElement>
              <ProjectTableDataElement>{t('Rate Limited')}</ProjectTableDataElement>
              <ProjectTableDataElement>{t('Filtered')}</ProjectTableDataElement>
              <ProjectTableDataElement>{t('Total')}</ProjectTableDataElement>
            </ProjectTableLayout>
          </PanelHeader>
          <PanelBody>
            {statsLoading || projectsLoading ? (
              <LoadingIndicator />
            ) : projectsError ? (
              <LoadingError onRetry={this.fetchData} />
            ) : (
              <ProjectTable
                projectTotals={projectTotals}
                orgTotal={orgTotal}
                organization={organization}
                projectMap={projectMap}
              />
            )}
          </PanelBody>
        </Panel>
        {pageLinks && <Pagination pageLinks={pageLinks} {...this.props} />}
      </div>
    );
  }

  render() {
    return (
      <React.Fragment>
        <PageContent>{this.renderContent()}</PageContent>
      </React.Fragment>
    );
  }
}

export default OrganizationStats;
