/**
 * Standard utility to enforce unified API JSON responses across Atlas.
 */
export class StandardResponse {
  /**
   * Returns a standard success response model.
   * @param {Object} data - The payload
   * @param {Object} meta - Optional metadata (e.g. pagination)
   * @param {string} message - Optional success message
   */
  static success(data = null, meta = null, message = 'Success') {
    const response = {
      success: true,
      message,
      data,
    };
    if (meta) {
      response.meta = meta;
    }
    return response;
  }

  /**
   * Returns a standard error response model.
   * @param {Error} error - The error object
   * @param {string} message - Optional override message
   * @param {number} code - Optional specific error code
   */
  static error(error, message = 'An error occurred', code = 'INTERNAL_ERROR') {
    return {
      success: false,
      error: {
        code: error.name === 'ValidationError' ? 'VALIDATION_ERROR' : code,
        message: error.name === 'ValidationError' ? 'Validation failed' : (error.message || message),
        details: error.details || null, // Capture Zod validation details here
      }
    };
  }

  /**
   * Convenient helper for paginated lists
   */
  static paginated(data, page, limit, total) {
    return this.success(data, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  }
}
