import React from 'react';

import {addErrorMessage, addSuccessMessage} from 'app/actionCreators/indicator';
import Feature from 'app/components/acl/feature';
import AsyncComponent from 'app/components/asyncComponent';
import Button from 'app/components/button';
import {t} from 'app/locale';
import {Config, Organization} from 'app/types';
import withOrganization from 'app/utils/withOrganization';
import withConfig from 'app/utils/withConfig';

//! Coordinate with other ExportQueryType (src/sentry/data_export/base.py)
export enum ExportQueryType {
  IssuesByTag = 'Issues-by-Tag',
  Discover = 'Discover',
}

type DataExportPayload = {
  queryType: ExportQueryType;
  queryInfo: any; // TODO(ts): Formalize different possible payloads
};

// TODO(Leander): Prefetch if this payload is in progress with this user (using config)
type Props = AsyncComponent['props'] & {
  /**
   * Config injected by withConfig HOC
   */
  config: Config;
  /**
   * Option prop to manually disable the button
   */
  disabled?: boolean;
  /**
   * Organization injected by withOrganization HOC
   */
  organization: Organization;
  /**
   * DataExportPayload to determine the type of data export
   */
  payload: DataExportPayload;
};

type State = AsyncComponent['state'] & {
  inProgress: boolean;
  dataExportId?: number;
};

class DataExport extends AsyncComponent<Props, State> {
  getDefaultState() {
    const state = super.getDefaultState();
    return {
      ...state,
      inProgress: false,
    };
  }

  startDataExport = async () => {
    const {
      organization: {slug},
      payload: {queryType, queryInfo},
    } = this.props;
    try {
      const {id: dataExportId} = await this.api.requestPromise(
        `/organizations/${slug}/data-export/`,
        {
          method: 'POST',
          data: {
            query_type: queryType,
            query_info: queryInfo,
          },
        }
      );
      addSuccessMessage(
        t("Sit tight. We'll shoot you an email when your data is ready for download.")
      );
      this.setState({inProgress: true, dataExportId});
    } catch (_err) {
      addErrorMessage(
        t("We tried our hardest, but we couldn't export your data. Give it another go.")
      );
    }
  };

  render() {
    const {inProgress, dataExportId} = this.state;
    const {children, disabled} = this.props;
    return (
      <Feature features={['data-export']}>
        {inProgress && dataExportId ? (
          <Button
            size="small"
            priority="default"
            title="You can get on with your life. We'll email you when your data's ready."
            {...this.props}
            disabled
          >
            {t("We're working on it...")}
          </Button>
        ) : (
          <Button
            onClick={this.startDataExport}
            disabled={disabled || false}
            size="small"
            priority="default"
            title="Put your data to work. Start your export and we'll email you when it's finished."
            {...this.props}
          >
            {children ? children : t('Export All to CSV')}
          </Button>
        )}
      </Feature>
    );
  }
}

export {DataExport};
export default withConfig(withOrganization(DataExport));
