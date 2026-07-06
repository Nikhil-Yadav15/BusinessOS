import { BaseOperation } from '../BaseOperation.js';
import { BusinessRepository } from '../../../persistence/repositories/BusinessRepository.js';
import { BusinessMemberRepository } from '../../../persistence/repositories/BusinessMemberRepository.js';
import { BusinessSettingsRepository } from '../../../persistence/repositories/BusinessSettingsRepository.js';
import { SecurityEventRepository } from '../../../persistence/repositories/SecurityEventRepository.js';
import { TenantBootstrapService } from '../../security/TenantBootstrapService.js';
import { ValidationError } from '../../errors/index.js';
import { DomainEvent } from '../../../infrastructure/events/DomainEvent.js';

const VALID_BUSINESS_TYPES = ['RETAIL', 'WHOLESALE', 'DISTRIBUTOR', 'MANUFACTURER', 'SERVICE'];

export class CreateBusinessOperation extends BaseOperation {
  
  async validate(context, input) {
    if (!context.userId) throw new ValidationError('User must be authenticated.');
    
    if (!input.name || !input.businessType || !input.phone) {
      throw new ValidationError('Business name, type, and phone are required.');
    }
    
    if (!VALID_BUSINESS_TYPES.includes(input.businessType)) {
      throw new ValidationError(`Invalid business type. Must be one of: ${VALID_BUSINESS_TYPES.join(', ')}`);
    }

    if (input.gstin && input.gstin.length !== 15) {
      throw new ValidationError('GSTIN must be exactly 15 characters.');
    }

    if (input.pan && input.pan.length !== 10) {
      throw new ValidationError('PAN must be exactly 10 characters.');
    }
  }

  async perform(context, input, tx) {
    const { userId } = context;
    const { ipAddress } = context.metadata;

    // 1. Create Business
    const business = await BusinessRepository.create({
      name: input.name,
      legalName: input.legalName || null,
      businessType: input.businessType,
      gstin: input.gstin || null,
      pan: input.pan || null,
      phone: input.phone,
      email: input.email || null,
      status: 'ACTIVE'
    }, tx);

    // 2. Create Member
    const member = await BusinessMemberRepository.create({
      businessId: business.id,
      userId: userId,
      status: 'ACTIVE'
    }, tx);

    // 3. Bootstrap RBAC Engine (All roles mapped)
    await TenantBootstrapService.bootstrap(
      business.id, 
      member.id, 
      userId, 
      tx
    );

    // 4. Business Settings (Relying on DB defaults for invoicePrefix and thresholds)
    const currentYear = new Date().getFullYear();
    await BusinessSettingsRepository.create({
      businessId: business.id,
      financialYearStart: `${currentYear}-04-01`
    }, tx);

    // 5. Audit
    await SecurityEventRepository.logEvent({
      userId,
      eventType: 'TENANT_BOOTSTRAPPED',
      severity: 'HIGH',
      ipAddress,
      details: { businessId: business.id, memberId: member.id }
    }, tx);

    return {
      business: { id: business.id, name: business.name, type: business.businessType },
      memberId: member.id
    };
  }

  // Pure function reliant on result, no mutable state
  createEvents(context, result) {
    return [
      DomainEvent.create('business.created', { businessId: result.business.id }, context)
    ];
  }
}