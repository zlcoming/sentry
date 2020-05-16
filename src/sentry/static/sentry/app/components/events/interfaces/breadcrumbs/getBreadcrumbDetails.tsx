import React from 'react';

import {Color} from 'sentry/utils/theme';
import HttpRenderer from 'sentry/components/events/interfaces/breadcrumbs/httpRenderer';
import ErrorRenderer from 'sentry/components/events/interfaces/breadcrumbs/errorRenderer';
import DefaultRenderer from 'sentry/components/events/interfaces/breadcrumbs/defaultRenderer';
import {
  IconInfo,
  IconLocation,
  IconRefresh,
  IconTerminal,
  IconUser,
  IconWarning,
} from 'sentry/icons';

import {Breadcrumb, BreadcrumbType} from './types';

type Output = {
  color: Color;
  borderColor: Color;
  icon: React.ReactElement;
  renderer: React.ReactElement;
};

function getBreadcrumbDetails(breadcrumb: Breadcrumb): Partial<Output> {
  switch (breadcrumb.type) {
    case BreadcrumbType.USER:
    case BreadcrumbType.UI: {
      return {
        color: 'purple400',
        icon: <IconUser />,
        renderer: <DefaultRenderer breadcrumb={breadcrumb} />,
      };
    }
    case BreadcrumbType.NAVIGATION: {
      return {
        color: 'blue400',
        icon: <IconLocation />,
        renderer: <DefaultRenderer breadcrumb={breadcrumb} />,
      };
    }
    case BreadcrumbType.INFO: {
      return {
        color: 'blue400',
        icon: <IconInfo />,
        renderer: <DefaultRenderer breadcrumb={breadcrumb} />,
      };
    }
    case BreadcrumbType.WARNING: {
      return {
        color: 'orange300',
        borderColor: 'orange500',
        icon: <IconWarning />,
        renderer: <ErrorRenderer breadcrumb={breadcrumb} />,
      };
    }
    case BreadcrumbType.EXCEPTION:
    case BreadcrumbType.MESSAGE:
    case BreadcrumbType.ERROR: {
      return {
        color: 'red400',
        icon: <IconWarning />,
        renderer: <ErrorRenderer breadcrumb={breadcrumb} />,
      };
    }
    case BreadcrumbType.HTTP: {
      return {
        color: 'green400',
        icon: <IconRefresh />,
        renderer: <HttpRenderer breadcrumb={breadcrumb} />,
      };
    }
    default:
      return {
        icon: <IconTerminal />,
        renderer: <DefaultRenderer breadcrumb={breadcrumb} />,
      };
  }
}

export default getBreadcrumbDetails;
