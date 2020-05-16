import React from 'react';
import styled from '@emotion/styled';

import Feature from 'sentry/components/acl/feature';
import GlobalSelectionHeader from 'sentry/components/organizations/globalSelectionHeader';
import {PageContent} from 'sentry/styles/organization';
import withGlobalSelection from 'sentry/utils/withGlobalSelection';

const Body = styled('div')`
  background-color: ${p => p.theme.gray100};
  flex-direction: column;
  flex: 1;
`;

class MonitorsContainer extends React.Component {
  render() {
    const {children} = this.props;

    return (
      <Feature features={['monitors']} renderDisabled>
        <GlobalSelectionHeader
          showEnvironmentSelector={false}
          showDateSelector={false}
          resetParamsOnChange={['cursor']}
        >
          <PageContent>
            <Body>{children}</Body>
          </PageContent>
        </GlobalSelectionHeader>
      </Feature>
    );
  }
}

export default withGlobalSelection(MonitorsContainer);
export {MonitorsContainer};
