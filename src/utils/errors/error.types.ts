/**
 * Detailed error information for validation or field-specific errors
 */
export type ErrorDetails = {
  /** Human-readable error message */
  message: string;
  /** Path to the field that caused the error (e.g., ['user', 'email']) */
  path?: (string | number)[];
};

/**
 * Standard error format for creating CustomError instances
 */
export type ErrorFormat = {
  /** Human-readable error message */
  message: string;
  /** HTTP status code */
  statusCode: number;
  /** Optional array of detailed errors (useful for validation) */
  errors?: ErrorDetails[];
};

/**
 * Standard API error response format
 */
export type ErrorResponse = {
  error: {
    /** HTTP status code */
    statusCode: number;
    /** Human-readable error message */
    message: string;
    /** Optional array of detailed errors */
    errors?: ErrorDetails[];
  };
};
