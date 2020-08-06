import React from 'react';
import styled from '@emotion/styled';

import {t} from 'app/locale';
import SentryTypes from 'app/sentryTypes';
import space from 'app/styles/space';
import withOrganization from 'app/utils/withOrganization';
import Button from 'app/components/button';
import {IconChevron} from 'app/icons';
import {getDiscover2UrlPathFromDiscoverQuery} from 'app/views/dashboards/utils/getDiscoverUrlPathFromDiscoverQuery';

class ExploreWidget extends React.Component {
  static propTypes = {
    widget: SentryTypes.Widget,
    organization: SentryTypes.Organization,
    selection: SentryTypes.GlobalSelection,
  };

  getExportToDiscover(query) {
    const {selection, organization} = this.props;
    return getDiscover2UrlPathFromDiscoverQuery({organization, selection, query});
  }

  render() {
    const {widget} = this.props;

    return (
      <ExploreButton
        borderless
        size="zero"
        to={this.getExportToDiscover(widget.savedQuery)}
      >
        {t('Explore Data')}
        <Chevron direction="right" size="xs" />
      </ExploreButton>
    );
  }
}
export default withOrganization(ExploreWidget);

const ExploreButton = styled(Button)`
  position: relative;
<<<<<<< HEAD
  ${p => p.isOpen && 'filter: drop-shadow(-7px -7px 12px rgba(47, 40, 55, 0.04));'};
`;

const ExploreAction = props => <Button priority="link" {...props} />;

const ExploreButton = styled(props => {
  const remaining = omit(props, 'isOpen');
  return <ExploreAction {...remaining} />;
})`
  position: relative;
  color: ${p => (p.isOpen ? p.theme.purple400 : p.theme.gray500)};
=======
  color: ${p => p.theme.gray500};
>>>>>>> Simplify explore action
  padding: ${space(1)} ${space(2)};
  border-radius: 0 0 ${p => p.theme.borderRadius} 0;

  &:hover {
    color: ${p => p.theme.purple400};
  }
<<<<<<< HEAD

  /* covers up borders to create a continous shape */
  ${p => (p.isOpen ? '&, &:hover, &:active { box-shadow: 0 -1px 0 #fff; }' : '')}
`;

const ExploreMenu = styled('div')`
  visibility: ${p => (p.isOpen ? 'visible' : 'hidden')};
  display: flex;
  flex-direction: column;
  min-width: 250px;

  position: absolute;
  right: -1px;
  bottom: 100%;
  z-index: ${p => p.theme.zIndex.dropdownAutocomplete.menu};

  background-color: white;
  border: 1px solid ${p => p.theme.borderLight};
`;

const ExploreRow = styled('li')`
  display: flex;
  align-items: center;
  padding: 0 ${space(0.5)};
`;

const QueryName = styled('span')`
  flex-grow: 1;
  white-space: nowrap;
  font-size: 0.9em;
  margin: ${space(1)};
  margin-right: ${space(2)};
=======
>>>>>>> Simplify explore action
`;

const Chevron = styled(IconChevron)`
  margin-left: ${space(0.25)};
`;
