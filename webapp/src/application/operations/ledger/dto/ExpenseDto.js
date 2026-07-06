import { z } from 'zod';

export const ExpenseDto = {
  create: z.object({
    expenseDate: z.string().datetime(),
    ledgerAccountId: z.string().uuid(),
    amount: z.coerce.number().positive('Expense amount must be greater than zero'),
    paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE']),
    remarks: z.string().optional().nullable()
  })
};
