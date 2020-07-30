export type TrendFunction = {
  label: string;
  field: string;
};

export enum TrendChangeType {
  IMPROVED = 'improved',
  REGRESSION = 'regression',
}

export type TrendsTransaction = {
  transaction: string;
  divide_aggregateRange_2_aggregateRange_1: number;
  minus_aggregateRange_2_aggregateRange_1: number;
  count: number;
  project: string;
  aggregateRange_1: number;
  aggregateRange_2: number;
  p99?: number;
  p95?: number;
  p75?: number;
  p50?: number;
  user_misery_300?: number;
  apdex_300?: number;
  count_1: number;
  count_2: number;
  divide_count_2_count_1: number;
};
