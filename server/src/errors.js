export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

export function errorHandler(error, _request, response, _next) {
  if (error instanceof ApiError) {
    return response.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {})
      }
    });
  }

  if (error?.type === 'entity.parse.failed') {
    return response.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'The request body must contain valid JSON.'
      }
    });
  }
  if (error?.type === 'entity.too.large') {
    return response.status(413).json({
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'The request body exceeds the allowed size.'
      }
    });
  }

  console.error(error);
  return response.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected server error occurred.'
    }
  });
}
