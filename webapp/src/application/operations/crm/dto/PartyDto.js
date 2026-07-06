import { z } from 'zod';
import { ValidationUtils } from '../../../common/ValidationUtils.js';

export const PartyDto = {
  create: z.object({
    partyType: z.enum(['CUSTOMER', 'SUPPLIER', 'BOTH']),
    name: z.string().min(1).max(200),
    companyName: z.string().max(200).optional().nullable(),
    mobile: z.string().max(15).optional().nullable(),
    email: z.string().email().max(255).optional().nullable(),
    gstin: z.string().max(15).optional().nullable(),
    pan: z.string().max(10).optional().nullable(),
    addressLine1: z.string().max(255).optional().nullable(),
    addressLine2: z.string().max(255).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    state: z.string().max(100).optional().nullable(),
    pincode: z.string().max(10).optional().nullable(),
    openingBalance: z.coerce.number().optional().default(0),
    notes: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  }),
  
  update: z.object({
    partyType: z.enum(['CUSTOMER', 'SUPPLIER', 'BOTH']).optional(),
    name: z.string().min(1).max(200).optional(),
    companyName: z.string().max(200).optional().nullable(),
    mobile: z.string().max(15).optional().nullable(),
    email: z.string().email().max(255).optional().nullable(),
    gstin: z.string().max(15).optional().nullable(),
    pan: z.string().max(10).optional().nullable(),
    addressLine1: z.string().max(255).optional().nullable(),
    addressLine2: z.string().max(255).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    state: z.string().max(100).optional().nullable(),
    pincode: z.string().max(10).optional().nullable(),
    notes: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};
