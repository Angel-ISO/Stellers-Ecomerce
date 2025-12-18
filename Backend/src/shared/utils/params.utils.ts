export interface ParamsOptions {
  pageSize?: number;
  pageIndex?: number;
  search?: string;
  maxPageSize?: number;
}

export interface ParamsResult {
  readonly pageSize: number;
  readonly pageIndex: number;
  readonly search: string;
  withPageSize: (newSize: number) => ParamsResult;
  withPageIndex: (newIndex: number) => ParamsResult;
  withSearch: (newSearch: string) => ParamsResult;
}

export function createParams({
  pageSize = 10,
  pageIndex = 1,
  search = '',
  maxPageSize = 50
}: ParamsOptions = {}): ParamsResult {
  return Object.freeze({
    get pageSize() {
      return Math.min(pageSize, maxPageSize);
    },
    get pageIndex() {
      return Math.max(pageIndex, 1);
    },
    get search() {
      return search.toLowerCase();
    },
    withPageSize: (newSize: number) => createParams({
      pageSize: newSize,
      pageIndex,
      search,
      maxPageSize
    }),
    withPageIndex: (newIndex: number) => createParams({
      pageSize,
      pageIndex: newIndex,
      search,
      maxPageSize
    }),
    withSearch: (newSearch: string) => createParams({
      pageSize,
      pageIndex,
      search: newSearch,
      maxPageSize
    })
  });
}