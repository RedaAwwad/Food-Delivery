export type Pagination = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
};

export type SuccessResponseParams<T> = {
  data?: T;
  message?: string;
  pagination?: Pagination;
};

class SuccessResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: Pagination;

  constructor({ data, message, pagination }: SuccessResponseParams<T>) {
    this.success = true;

    if (data) this.data = data;

    if (message) this.message = message;

    if (pagination) this.pagination = pagination;
  }
}

export { SuccessResponse };
