import { BaseOperation } from '../BaseOperation.js';
import { PartyRepository } from '../../../persistence/repositories/PartyRepository.js';
import { DomainEvent } from '../../../infrastructure/events/DomainEvent.js';
import { PartyDto } from './dto/PartyDto.js';
import { validateDto } from '../../common/ValidationUtils.js';

export class CreatePartyOperation extends BaseOperation {
  async validate(context, input) {
    // 1. Zod Struct Validation
    this.validatedData = validateDto(PartyDto.create, input);

    // 2. Business Logic Validation (Unique GSTIN / Mobile for this business)
    // Here you would check PartyRepository for duplicates of mobile/gstin within context.businessId
    // and throw a clean ValidationError if it hits. We'll let Postgres handle the UNIQUE constraint for now
    // which triggers an error bubbled up cleanly in handleError.
  }

  async perform(context, input, tx) {
    const businessId = context.businessId;
    if (!businessId) throw new Error('businessId is missing from execution context');

    // Merge businessId natively
    const recordToInsert = {
      ...this.validatedData,
      businessId
    };

    const party = await PartyRepository.create(recordToInsert, tx);
    return party;
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('crm.party.created', {
        businessId: context.businessId,
        aggregateId: result.id,
        partyType: result.partyType,
        name: result.name
      }, context)
    ];
  }
}
