/**
 * Error codes for categorizing different types of errors
 * @enum {string}
 */
export type ErrorCode =
    | "ERR_BAD_REQUEST"
    | "ERR_UNAUTHORIZED"
    | "ERR_FORBIDDEN"
    | "ERR_NOT_FOUND"
    | "ERR_CONFLICT"
    | "ERR_VALIDATION"
    | "ERR_INTERNAL"
    | "ERR_SERVICE_UNAVAILABLE";

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
    /** Optional error code for categorization */
    code?: ErrorCode;
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
        /** Optional error code for categorization */
        code?: ErrorCode;
        /** Optional array of detailed errors */
        errors?: ErrorDetails[];
        /** Stack trace (only in development) */
        stack?: string;
        /** Original error (only in development) */
        original?: any;
    };
};
