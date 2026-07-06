import { z } from 'zod';

export const StockAdjustmentDto = z.object({
  productId: z.string().uuid(),
  quantityChange: z.coerce.number().describe('Positive to add stock, negative to reduce'),
  reason: z.string().min(1).max(500),
});
