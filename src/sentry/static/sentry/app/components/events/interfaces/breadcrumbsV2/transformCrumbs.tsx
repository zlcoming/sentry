import {convertCrumbType} from './convertCrumbType';
import {getCrumbDetails} from './getCrumbDetails';
import {Breadcrumb, BreadcrumbsWithDetails} from './types';

const transformCrumbs = (breadcrumbs: Array<Breadcrumb>): BreadcrumbsWithDetails => {
  return breadcrumbs.map((breadcrumb, index) => {
    const convertedCrumbType = convertCrumbType(breadcrumb);
    const crumbDetails = getCrumbDetails(convertedCrumbType.type);
    return {
      id: index,
      ...convertedCrumbType,
      ...crumbDetails,
    };
  });
};

export {transformCrumbs};
