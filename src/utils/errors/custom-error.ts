class CustomError extends Error {
  message: string;
  statusCode: number;
  errors?: ErrorDetails[];

  constructor({ message, statusCode, errors }: ErrorFormat) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.errors = errors as ErrorDetails[];
  }
}

export { CustomError };
