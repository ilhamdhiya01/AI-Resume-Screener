export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
};
