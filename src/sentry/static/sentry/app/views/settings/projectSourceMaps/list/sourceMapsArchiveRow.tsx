import React from 'react';
import styled from '@emotion/styled';

import {SourceMapsArchive} from 'sentry/types';
import {t} from 'sentry/locale';
import Button from 'sentry/components/button';
import {IconDelete} from 'sentry/icons';
import ButtonBar from 'sentry/components/buttonBar';
import Version from 'sentry/components/version';
import Count from 'sentry/components/count';
import Confirm from 'sentry/components/confirm';
import DateTime from 'sentry/components/dateTime';
import Link from 'sentry/components/links/link';
import TextOverflow from 'sentry/components/textOverflow';
import space from 'sentry/styles/space';

type Props = {
  archive: SourceMapsArchive;
  orgId: string;
  projectId: string;
  onDelete: (name: string) => void;
};

const SourceMapsArchiveRow = ({archive, orgId, projectId, onDelete}: Props) => {
  const {name, date, fileCount} = archive;
  const archiveLink = `/settings/${orgId}/projects/${projectId}/source-maps/${encodeURIComponent(
    name
  )}`;
  return (
    <React.Fragment>
      <Column>
        <TextOverflow>
          <Link to={archiveLink}>
            <Version version={name} anchor={false} tooltipRawVersion truncate />
          </Link>
        </TextOverflow>
      </Column>
      <ArtifactsColumn>
        <Count value={fileCount} />
      </ArtifactsColumn>
      <Column>{t('release')}</Column>
      <Column>
        <DateTime date={date} />
      </Column>
      <ActionsColumn>
        <ButtonBar gap={0.5}>
          <Confirm
            onConfirm={() => onDelete(name)}
            message={t('Are you sure you want to remove all artifacts in this archive?')}
          >
            <Button
              size="small"
              icon={<IconDelete size="sm" />}
              title={t('Remove All Artifacts')}
            />
          </Confirm>
        </ButtonBar>
      </ActionsColumn>
    </React.Fragment>
  );
};

const Column = styled('div')`
  display: flex;
  align-items: center;
  overflow: hidden;
`;

const ArtifactsColumn = styled(Column)`
  padding-right: ${space(4)};
  text-align: right;
  justify-content: flex-end;
`;

const ActionsColumn = styled(Column)`
  justify-content: flex-end;
`;

export default SourceMapsArchiveRow;
