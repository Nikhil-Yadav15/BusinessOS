import { z } from 'zod';

export const UnitDto = {
  create: z.object({
    name: z.string().min(1).max(50),
    shortName: z.string().min(1).max(20),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  }),
  
  update: z.object({
    name: z.string().min(1).max(50).optional(),
    shortName: z.string().min(1).max(20).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
};
