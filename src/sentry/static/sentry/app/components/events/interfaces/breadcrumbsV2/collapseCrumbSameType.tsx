import {BreadcrumbsWithDetails} from './types';

type CollapsedBreadcrumbs = Array<
  BreadcrumbsWithDetails[0] & {breadcrumbs?: BreadcrumbsWithDetails}
>;

function collapseCrumbSameType(breadcrumbs: BreadcrumbsWithDetails) {
  const collapsedcrumbs: CollapsedBreadcrumbs = [];

  for (const index in breadcrumbs) {
    const breadcrumb = breadcrumbs[index];
    const foundCrumbSameType = collapsedcrumbs.findIndex(
      collapsedcrumb => collapsedcrumb.type === breadcrumb.type
    );

    if (foundCrumbSameType !== -1) {
      const collapsedcrumb = collapsedcrumbs[foundCrumbSameType];
      collapsedcrumb?.breadcrumbs ? collapsedcrumb.breadcrumbs.push(breadcrumb) : [];
      continue;
    }

    collapsedcrumbs.push(breadcrumb);
  }

  return collapsedcrumbs;
}

export {collapseCrumbSameType};
