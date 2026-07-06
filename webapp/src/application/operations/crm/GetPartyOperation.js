import { BaseOperation } from '../BaseOperation.js';
import { PartyRepository } from '../../../persistence/repositories/PartyRepository.js';

export class GetPartyOperation extends BaseOperation {
  async perform(context, input, tx) {
    if (!input.id) throw new Error('Party ID is required');

    const party = await PartyRepository.findById(input.id, tx);
    if (!party || party.businessId !== context.businessId) {
      const err = new Error('Party not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    return party;
  }
}
