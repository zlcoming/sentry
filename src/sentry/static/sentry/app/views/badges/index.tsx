import React from 'react';

import {t} from 'app/locale';
import {Organization} from 'app/types';
import {PageContent} from 'app/styles/organization';
import SentryTypes from 'app/sentryTypes';
// import Feature from 'app/components/acl/feature';
import Alert from 'app/components/alert';
import withOrganization from 'app/utils/withOrganization';
import PageHeading from 'app/components/pageHeading';

import DocumentTitle from 'react-document-title';
// import styled from '@emotion/styled';

import {BadgesWrapper, BadgesContainer, HeadingContainer} from './styles';

type Props = {
  organization: Organization;
};

class Badges extends React.Component<Props> {
  static propTypes = {
    organization: SentryTypes.Organization.isRequired,
  };
  render() {
    return (
      <DocumentTitle title={`Badges`}>
        <BadgesWrapper>
          <PageHeading>{t('Badges')}</PageHeading>
        </BadgesWrapper>
      </DocumentTitle>
    );
  }
}

export default withOrganization(Badges);
