export type ErrorCode =
  | "ERR_BAD"
  | "ERR_NF"
  | "ERR_NF_ROUTE"
  | "ERR_VALID"
  | "ERR_INTERNAL";

export type ErrorDetails = {
  message: string;
  path?: (string | number)[];
};

export type ErrorFormat = {
  message: string;
  statusCode: number;
  code?: ErrorCode;
  errors?: ErrorDetails[];
};
