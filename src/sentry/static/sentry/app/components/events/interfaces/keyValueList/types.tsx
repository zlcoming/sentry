import {Meta} from 'sentry/types';

export type KeyValueListData = {
  key: string;
  subject: string;
  value?: React.ReactNode;
  meta?: Meta;
  subjectDataTestId?: string;
  subjectIcon?: React.ReactNode;
};
