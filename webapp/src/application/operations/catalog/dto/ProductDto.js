import { z } from 'zod';

export const ProductDto = {
  create: z.object({
    categoryId: z.string().uuid().optional().nullable(),
    brandId: z.string().uuid().optional().nullable(),
    unitId: z.string().uuid(),
    sku: z.string().min(1).max(100),
    barcode: z.string().max(100).optional().nullable(),
    name: z.string().min(1).max(200),
    description: z.string().optional().nullable(),
    
    // Zod's coerce will treat input strings as numbers internally
    purchasePrice: z.coerce.number().nonnegative(),
    sellingPrice: z.coerce.number().nonnegative(),
    mrp: z.coerce.number().nonnegative().optional().nullable(),
    gstRate: z.coerce.number().nonnegative().default(0),
    minimumStock: z.coerce.number().nonnegative().default(0),
    
    hsnCode: z.string().max(20).optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  }),
  
  update: z.object({
    categoryId: z.string().uuid().optional().nullable(),
    brandId: z.string().uuid().optional().nullable(),
    unitId: z.string().uuid().optional(),
    sku: z.string().min(1).max(100).optional(),
    barcode: z.string().max(100).optional().nullable(),
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional().nullable(),
    
    purchasePrice: z.coerce.number().nonnegative().optional(),
    sellingPrice: z.coerce.number().nonnegative().optional(),
    mrp: z.coerce.number().nonnegative().optional().nullable(),
    gstRate: z.coerce.number().nonnegative().optional(),
    minimumStock: z.coerce.number().nonnegative().optional(),
    
    hsnCode: z.string().max(20).optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
};
