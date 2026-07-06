import { BaseOperation } from '../BaseOperation.js';
import { PartyRepository } from '../../../persistence/repositories/PartyRepository.js';
import { DomainEvent } from '../../../infrastructure/events/DomainEvent.js';
import { PartyDto } from './dto/PartyDto.js';
import { validateDto } from '../../common/ValidationUtils.js';

export class UpdatePartyOperation extends BaseOperation {
  async validate(context, input) {
    if (!input.id) throw new Error('Party ID is required for update');
    this.id = input.id;
    this.validatedData = validateDto(PartyDto.update, input.data);
  }

  async perform(context, input, tx) {
    const businessId = context.businessId;
    
    // Ensure the party exists and belongs to the active tenant
    const existing = await PartyRepository.findById(this.id, tx);
    if (!existing || existing.businessId !== businessId) {
      const err = new Error('Party not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    const updated = await PartyRepository.update(this.id, this.validatedData, tx);
    return updated;
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('crm.party.updated', {
        businessId: context.businessId,
        aggregateId: result.id,
      }, context)
    ];
  }
}
