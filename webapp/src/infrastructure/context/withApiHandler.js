/**
 * Higher-order wrapper to standardize error catching and HTTP responses across all API routes.
 * @param {Function} handler - The Next.js route handler
 */
export function withApiHandler(handler) {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      const status = error.status || 500;
      const message = status === 500 ? 'Internal Server Error' : error.message;

      // Ensure 500s are still logged to the console for internal debugging
      if (status === 500) {
        console.error('[Unhandled API Error]', error);
      }

      return Response.json({ error: message }, { status });
    }
  };
}