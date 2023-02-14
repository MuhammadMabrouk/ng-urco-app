export interface SimplePagination {
  // items count
  allItemsCount?: number;
  viewItemsCountStart?: number;
  viewItemsCountEnd?: number;
  // page number in the browser url
  pageNumber?: number;
  // the first & last items of the currently viewed page
  firstItem?: any;
  lastItem?: any;
  // conditions to enable or disable the navigation buttons
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}
