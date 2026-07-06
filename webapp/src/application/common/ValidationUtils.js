import { z } from 'zod';

export const ValidationUtils = {
  // Common UUIDv7 format validation
  uuid: z.string().uuid('Invalid UUID format'),

  // Pagination query validation schema
  pagination: z.object({
    page: z.coerce.number().int().min(1).nullish().default(1),
    limit: z.coerce.number().int().min(1).max(100).nullish().default(10),
    sortBy: z.string().nullish().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).nullish().default('desc'),
  }),

  // Standard phone number (simple format)
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),

  // Standard monetary amount validation (positive values, max 2 decimals)
  money: z.number().nonnegative('Amount cannot be negative'),
};

/**
 * Helper to safely validate an input against a Zod schema and throw standardized errors if failing.
 */
export const validateDto = (schema, input) => {
  const result = schema.safeParse(input);
  if (!result.success) {
    const rawErrors = result.error.issues || result.error.errors || [];
    const errors = rawErrors.map(err => ({
      field: (err.path || []).join('.'),
      message: err.message
    }));
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    error.status = 400; // Force HTTP 400 Bad Request
    error.details = errors;
    throw error;
  }
  return result.data;
};
