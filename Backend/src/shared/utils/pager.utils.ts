export interface PagerOptions {
  registers?: any[];
  total?: number;
  pageIndex?: number;
  pageSize?: number;
  search?: string;
}

export interface PagerResult<T = any> {
  registers: T[];
  total: number;
  pageIndex: number;
  pageSize: number;
  search: string;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  mapRegisters: <U>(mapperFn: (item: T) => U) => PagerResult<U>;
  filterRegisters: (predicateFn: (item: T) => boolean) => PagerResult<T>;
  getPaginationInfo: () => {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    search: string;
  };
}

export function createPager<T = any>({
  registers = [],
  total = 0,
  pageIndex = 1,
  pageSize = 10,
  search = ''
}: PagerOptions = {}): PagerResult<T> {
  const totalPages = Math.ceil(total / pageSize);
  const hasPreviousPage = pageIndex > 1;
  const hasNextPage = pageIndex < totalPages;

  return Object.freeze({
    registers: registers as T[],
    total,
    pageIndex,
    pageSize,
    search,

    totalPages,
    hasPreviousPage,
    hasNextPage,

    mapRegisters: <U>(mapperFn: (item: T) => U) => createPager<U>({
      registers: registers.map(mapperFn),
      total,
      pageIndex,
      pageSize,
      search
    }) as PagerResult<U>,

    filterRegisters: (predicateFn: (item: T) => boolean) => createPager<T>({
      registers: registers.filter(predicateFn),
      total: registers.filter(predicateFn).length,
      pageIndex,
      pageSize,
      search
    }),

    getPaginationInfo: () => ({
      currentPage: pageIndex,
      pageSize,
      totalCount: total,
      totalPages,
      hasPrevious: hasPreviousPage,
      hasNext: hasNextPage,
      search
    })
  });
}