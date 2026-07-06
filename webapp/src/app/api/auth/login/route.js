import { LoginOperation } from '../../../../application/operations/auth/LoginOperation.js';
import { buildAnonymousContext } from '../../../../infrastructure/context/buildContext.js';

export async function POST(req) {
  try {
    const payload = await req.json();

    // 1. Construct Anonymous Execution Context (Captures Metadata & Correlation ID)
    const anonymousContext = buildAnonymousContext(req);

    // 2. Execute the Business Operation
    const operation = new LoginOperation();
    
    // Pass payload directly; Operation will read ipAddress/userAgent from context.metadata
    const result = await operation.execute(anonymousContext, payload);

    // 3. Return Standardized Response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Standardized error resolution relying on the Typed Error hierarchy
    const status = error.status || 500;
    const message = status === 500 ? 'Internal Server Error' : error.message;

    return new Response(
      JSON.stringify({ error: message }), 
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}