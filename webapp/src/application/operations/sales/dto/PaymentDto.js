import { z } from 'zod';

export const PaymentDto = {
  create: z.object({
    invoiceId: z.string().uuid(),
    paymentDate: z.string().datetime(),
    paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE']),
    amount: z.coerce.number().positive('Payment amount must be greater than zero'),
    referenceNumber: z.string().max(100).optional().nullable(),
    remarks: z.string().optional().nullable()
  })
};
