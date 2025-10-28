class CustomError extends Error {
  message: string;
  statusCode: number;
  code?: ErrorCode;
  errors?: ErrorDetails[];

  constructor({ message, statusCode, code, errors }: ErrorFormat) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.code = code as ErrorCode;
    this.errors = errors as ErrorDetails[];
  }
}

export { CustomError };
