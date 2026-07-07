/**
 * Higher-order wrapper to standardize error catching and HTTP responses across all API routes.
 * @param {Function} handler - The Next.js route handler
 */
export function withApiHandler(handler) {
  return async (req, context) => {
    try {
      // Next.js 15: params is a Promise — resolve it once here so all handlers
      // receive a plain object via context.params without needing to await it themselves.
      const resolvedParams = context?.params ? await context.params : {};
      return await handler(req, { ...context, params: resolvedParams });
    } catch (error) {
      const status = error.status || (error.message && !error.message.includes('Internal') ? 400 : 500);
      const message = status === 500 ? 'Internal Server Error' : error.message;

      // Ensure 500s are still logged to the console for internal debugging
      if (status === 500) {
        console.error('[Unhandled API Error]', error);
      }

      return Response.json({ error: message, message: message }, { status });
    }
  };
}