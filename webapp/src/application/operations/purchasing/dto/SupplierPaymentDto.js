import { z } from 'zod';

export const SupplierPaymentDto = {
  create: z.object({
    purchaseId: z.string().uuid(),
    paymentDate: z.string().datetime(),
    paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE']),
    amount: z.coerce.number().positive(),
    referenceNumber: z.string().max(100).optional().nullable(),
    remarks: z.string().optional().nullable()
  })
};
