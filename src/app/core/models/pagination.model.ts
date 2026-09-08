export enum FilterType {
  Equals = 'Equals',
  NotEquals = 'NotEquals',
  Range = 'Range',
  Contains = 'Contains',
  LessThan = 'LessThan',
  LessThanOrEqual = 'LessThanOrEqual',
  GreaterThan = 'GreaterThan',
  GreaterThanOrEqual = 'GreaterThanOrEqual',
  IsNull = 'IsNull',
  IsNotNull = 'IsNotNull'
}

export enum FilterOperator {
  And = 'And',
  Or = 'Or'
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export interface FilteredQuery {
  propertyName: string;
  values: string[];
  type?: FilterType;
  operator?: FilterOperator;
}

export interface SortedQuery {
  propertyName: string;
  direction?: SortDirection;
}

export interface BasePaginatedQuery {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  filters?: FilteredQuery[];
  sorts?: SortedQuery[];
}

export interface BasePaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
