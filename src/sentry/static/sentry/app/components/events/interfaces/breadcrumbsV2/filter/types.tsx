import {BreadcrumbType, BreadcrumbLevelType} from '../../breadcrumbs/types';

export type Option = {
  type: BreadcrumbType;
  isChecked: boolean;
  symbol: React.ReactNode;
  levels: Array<BreadcrumbLevelType>;
  description?: string;
};
