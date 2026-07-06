import { z } from 'zod';

export const InvoiceDto = {
  create: z.object({
    customerId: z.string().uuid().optional().nullable(),
    invoiceType: z.enum(['SALE', 'RETURN']).optional().default('SALE'),
    invoiceDate: z.string().datetime(), // ISO 8601 string from frontend
    
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
      unitPrice: z.coerce.number().nonnegative(),
      discountAmount: z.coerce.number().nonnegative().optional().default(0),
      taxAmount: z.coerce.number().nonnegative().optional().default(0),
      lineTotal: z.coerce.number().nonnegative()
    })).min(1, 'At least one item is required in the invoice')
  })
};
