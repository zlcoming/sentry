import React from 'react';
import styled from '@emotion/styled';

import {openHelpSearchModal} from 'sentry/actionCreators/modal';
import {t} from 'sentry/locale';
import DropdownMenu from 'sentry/components/dropdownMenu';
import SidebarItem from 'sentry/components/sidebar/sidebarItem';
import Hook from 'sentry/components/hook';
import {IconQuestion} from 'sentry/icons';
import {Organization} from 'sentry/types';

import SidebarMenuItem from './sidebarMenuItem';
import SidebarDropdownMenu from './sidebarDropdownMenu.styled';
import {CommonSidebarProps} from './types';

type Props = Pick<CommonSidebarProps, 'collapsed' | 'hidePanel' | 'orientation'> & {
  organization: Organization;
};

const SidebarHelp = ({orientation, collapsed, hidePanel, organization}: Props) => (
  <DropdownMenu>
    {({isOpen, getActorProps, getMenuProps}) => (
      <HelpRoot>
        <HelpActor {...getActorProps({onClick: hidePanel})}>
          <SidebarItem
            orientation={orientation}
            collapsed={collapsed}
            hasPanel={false}
            icon={<IconQuestion size="md" />}
            label={t('Help')}
            id="help"
          />
        </HelpActor>

        {isOpen && (
          <HelpMenu {...getMenuProps({})}>
            <Hook name="sidebar:help-menu" organization={organization} />
            <SidebarMenuItem onClick={openHelpSearchModal}>
              {t('Search Docs and FAQs')}
            </SidebarMenuItem>
            <SidebarMenuItem href="https://forum.sentry.io/">
              {t('Community Discussions')}
            </SidebarMenuItem>
            <SidebarMenuItem href="https://status.sentry.io/">
              {t('Service Status')}
            </SidebarMenuItem>
          </HelpMenu>
        )}
      </HelpRoot>
    )}
  </DropdownMenu>
);

export default SidebarHelp;

const HelpRoot = styled('div')`
  position: relative;
`;

// This exists to provide a styled actor for the dropdown. Making the actor a regular,
// non-styled react component causes some issues with toggling correctly because of
// how refs are handled.
const HelpActor = styled('div')``;

const HelpMenu = styled('div')`
  ${SidebarDropdownMenu};
  bottom: 100%;
`;
