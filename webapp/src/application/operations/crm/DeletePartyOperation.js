import { BaseOperation } from '../BaseOperation.js';
import { PartyRepository } from '../../../persistence/repositories/PartyRepository.js';
import { DomainEvent } from '../../../infrastructure/events/DomainEvent.js';

export class DeletePartyOperation extends BaseOperation {
  async validate(context, input) {
    if (!input.id) throw new Error('Party ID is required');
    this.id = input.id;
  }

  async perform(context, input, tx) {
    const existing = await PartyRepository.findById(this.id, tx);
    if (!existing || existing.businessId !== context.businessId) {
      const err = new Error('Party not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    await PartyRepository.delete(this.id, tx);
    return { success: true };
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('crm.party.deleted', {
        businessId: context.businessId,
        aggregateId: this.id,
      }, context)
    ];
  }
}
