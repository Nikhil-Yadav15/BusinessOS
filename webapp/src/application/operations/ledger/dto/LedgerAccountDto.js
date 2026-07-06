import { z } from 'zod';

export const LedgerAccountDto = {
  create: z.object({
    accountCode: z.string().min(1).max(20),
    accountName: z.string().min(1).max(150),
    accountType: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']),
    parentAccountId: z.string().uuid().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE')
  }),

  update: z.object({
    accountCode: z.string().min(1).max(20).optional(),
    accountName: z.string().min(1).max(150).optional(),
    accountType: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']).optional(),
    parentAccountId: z.string().uuid().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional()
  })
};
