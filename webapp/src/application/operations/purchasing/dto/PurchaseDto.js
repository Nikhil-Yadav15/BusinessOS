import { z } from 'zod';

export const PurchaseDto = {
  create: z.object({
    supplierId: z.string().uuid(),
    purchaseType: z.enum(['PURCHASE', 'RETURN']).optional().default('PURCHASE'),
    purchaseDate: z.string().datetime(), // ISO 8601 string
    supplierInvoiceNumber: z.string().max(100).optional().nullable(),
    
    // Totals
    subtotal: z.coerce.number().nonnegative(),
    discountAmount: z.coerce.number().nonnegative().optional().default(0),
    taxAmount: z.coerce.number().nonnegative().optional().default(0),
    totalAmount: z.coerce.number().nonnegative(),
    
    notes: z.string().optional().nullable(),
    status: z.enum(['DRAFT', 'FINALIZED']).optional().default('DRAFT'),

    // Line items
    items: z.array(z.object({
      productId: z.string().uuid(),
      quantity: z.coerce.number().positive(),
      unitCost: z.coerce.number().nonnegative(),
      discountAmount: z.coerce.number().nonnegative().optional().default(0),
      taxAmount: z.coerce.number().nonnegative().optional().default(0),
      lineTotal: z.coerce.number().nonnegative()
    })).min(1, 'At least one item is required in the purchase')
  })
};
