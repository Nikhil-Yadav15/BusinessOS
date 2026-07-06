import { z } from 'zod';

export const CategoryDto = {
  create: z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  }),
  
  update: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
};
