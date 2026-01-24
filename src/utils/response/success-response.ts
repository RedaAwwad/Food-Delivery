export type Pagination = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type SuccessResponseParams<T> = {
  data?: T;
  message?: string;
  meta?: Pagination;
};

class SuccessResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: Pagination;

  constructor({ data, message, meta }: SuccessResponseParams<T>) {
    this.success = true;

    if (data) this.data = data;

    if (message) this.message = message;

    if (meta) this.meta = meta;
  }
}

export { SuccessResponse };
