// 📄 Generic client-side pagination shape (see lib/use-pagination).

export type Paged<T> = {
  page: number;
  pageCount: number;
  pageItems: T[];
  total: number;
  /** 🔢 1-based index of the first item shown on the current page (0 when empty). */
  from: number;
  /** 🔢 1-based index of the last item shown on the current page. */
  to: number;
  setPage: (p: number) => void;
  next: () => void;
  prev: () => void;
  canPrev: boolean;
  canNext: boolean;
};
