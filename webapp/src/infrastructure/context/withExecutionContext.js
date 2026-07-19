import { buildContext } from './buildContext.js';

/**
 * Wraps a Next.js App Router API handler to inject the ExecutionContext.
 * @param {Function} handler - Your standard Next.js route handler
 */
export function withExecutionContext(handler) {
  return async (req, context) => {
    try {
      // Create the trusted context before execution
      const executionContext = await buildContext(req);
      
      // Inject the context into the route handler
      return await handler(req, { ...context, executionContext });
      
    } catch (error) {
      console.error('Gateway Protection Error:', error);
      if (error.cause) {
        console.error('Gateway Protection Error Cause:', error.cause);
      }
      
      const status = error.message.includes('Unauthorized') ? 401 : 403;
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}