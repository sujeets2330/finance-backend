export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public errors?: Record<string, string[]>) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends APIError {
  constructor(message: string) {
    super(409, message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export function formatErrorResponse(error: unknown) {
  if (error instanceof APIError) {
    return {
      status: error.statusCode,
      code: error.code,
      message: error.message,
      ...(error instanceof ValidationError && { errors: error.errors }),
    };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
  }

  return {
    status: 500,
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  };
}
