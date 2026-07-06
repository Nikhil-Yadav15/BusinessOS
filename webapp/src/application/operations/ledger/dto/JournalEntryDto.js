import { z } from 'zod';

export const JournalEntryDto = {
  create: z.object({
    entryDate: z.string().datetime(),
    referenceType: z.string().max(30).optional().nullable(),
    referenceId: z.string().uuid().optional().nullable(),
    description: z.string().optional().nullable(),

    // Double-entry validation: Credits must equal Debits in total
    lines: z.array(z.object({
      ledgerAccountId: z.string().uuid(),
      debitAmount: z.coerce.number().nonnegative().optional().default(0),
      creditAmount: z.coerce.number().nonnegative().optional().default(0)
    })).min(2, 'A journal entry must contain at least 2 lines (debit and credit)')
  })
};
