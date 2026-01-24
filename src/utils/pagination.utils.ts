import { Pagination } from "./response/success-response";

export type PaginationDto = {
  page?: string;
  perPage?: string;
};

export const handleQueryPagination = (query: PaginationDto) => {
  let page = 1;
  let perPage = 10;

  if (query.page && Number(query.page) > 0) {
    page = Number(query.page);
  }

  if (query.perPage && Number(query.perPage) > 0) {
    perPage = Number(query.perPage);
  }

  const skip = (page - 1) * perPage;

  return { skip, take: perPage };
};

export const formatPagination = ({
  page,
  perPage,
  total,
}: {
  page: number;
  perPage: number;
  total: number;
}): Pagination => {
  const perPageValue = perPage && perPage > 0 ? perPage : 10;

  return {
    page: page > 1 ? page : 1,
    perPage: perPageValue,
    total,
    totalPages: Math.ceil(total / perPageValue),
  };
};
