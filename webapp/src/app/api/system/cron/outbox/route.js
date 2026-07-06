import { OutboxProcessor } from '../../../../../infrastructure/events/OutboxProcessor.js';
import { StandardResponse } from '../../../../../application/common/StandardResponse.js';

/**
 * Background hook for cron jobs/pollers to fire.
 * In production this would be secured behind an API Key or Vercel Cron header.
 */
export async function GET(req) {
  try {
    const result = await OutboxProcessor.processBatch(25);
    return Response.json(StandardResponse.success(result));
  } catch (err) {
    console.error('Outbox Cron Processing Error:', err);
    return Response.json(
      { success: false, message: 'Internal Server Error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
