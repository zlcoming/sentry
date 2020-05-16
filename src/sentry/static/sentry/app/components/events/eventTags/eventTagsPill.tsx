import React from 'react';
import styled from '@emotion/styled';
import {Link} from 'react-router';
import * as queryString from 'query-string';
import {Query, Location} from 'history';

import {EventTag, Meta} from 'sentry/types';
import AnnotatedText from 'sentry/components/events/meta/annotatedText';
import DeviceName from 'sentry/components/deviceName';
import {isUrl} from 'sentry/utils';
import Pill from 'sentry/components/pill';
import VersionHoverCard from 'sentry/components/versionHoverCard';
import TraceHoverCard from 'sentry/utils/discover/traceHoverCard';
import Version from 'sentry/components/version';
import {IconOpen, IconInfo} from 'sentry/icons';

type Props = {
  tag: EventTag;
  streamPath: string;
  releasesPath: string;
  query: Query;
  location: Location;
  orgId: string;
  projectId: string;
  meta: Meta;
  hasQueryFeature: boolean;
};

const EventTagsPill = ({
  tag,
  query,
  orgId,
  projectId,
  streamPath,
  releasesPath,
  meta,
  location,
  hasQueryFeature,
}: Props) => {
  const locationSearch = `?${queryString.stringify(query)}`;
  const isRelease = tag.key === 'release';
  const isTrace = tag.key === 'trace';
  return (
    <Pill key={tag.key} name={tag.key} value={tag.value}>
      <Link
        to={{
          pathname: streamPath,
          search: locationSearch,
        }}
      >
        {isRelease ? (
          <Version version={tag.value} anchor={false} tooltipRawVersion truncate />
        ) : (
          <DeviceName value={tag.value}>
            {deviceName => <AnnotatedText value={deviceName} meta={meta} />}
          </DeviceName>
        )}
      </Link>
      {isUrl(tag.value) && (
        <a href={tag.value} className="external-icon">
          <StyledIconOpen size="xs" />
        </a>
      )}
      {isRelease && (
        <div className="pill-icon">
          <VersionHoverCard
            orgSlug={orgId}
            projectSlug={projectId}
            releaseVersion={tag.value}
          >
            <Link
              to={{
                pathname: `${releasesPath}${tag.value}/`,
                search: locationSearch,
              }}
            >
              <StyledIconInfo size="xs" />
            </Link>
          </VersionHoverCard>
        </div>
      )}
      {isTrace && hasQueryFeature && (
        <TraceHoverCard
          containerClassName="pill-icon"
          traceId={tag.value}
          orgId={orgId}
          location={location}
        >
          {({to}) => {
            return (
              <Link to={to}>
                <StyledIconOpen size="xs" />
              </Link>
            );
          }}
        </TraceHoverCard>
      )}
    </Pill>
  );
};

const StyledIconInfo = styled(IconInfo)`
  position: relative;
  top: 1px;
`;

const StyledIconOpen = styled(IconOpen)`
  position: relative;
  top: 1px;
`;

export default EventTagsPill;
