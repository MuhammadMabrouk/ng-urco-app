export type OrderByDirection = 'asc' | 'desc'; // (ascending or descending)

export interface GoodsSortingMethod {
  filed: string;
  sortingDir: OrderByDirection;
}
