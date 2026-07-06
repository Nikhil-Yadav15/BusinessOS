import { BaseOperation } from '../../BaseOperation.js';
import { LedgerAccountRepository } from '../../../../persistence/repositories/LedgerAccountRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';
import { LedgerAccountDto } from '../dto/LedgerAccountDto.js';
import { validateDto } from '../../../common/ValidationUtils.js';

export class CreateLedgerAccountOperation extends BaseOperation {
  async validate(context, input) {
    this.validatedData = validateDto(LedgerAccountDto.create, input);
  }

  async perform(context, input, tx) {
    const { businessId } = context;
    if (!businessId) throw new Error('businessId is required');

    const account = await LedgerAccountRepository.create({
      ...this.validatedData,
      businessId
    }, tx);

    return account;
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('ledger.account.created', {
        businessId: context.businessId,
        aggregateId: result.id,
        accountCode: result.accountCode,
        accountType: result.accountType
      }, context)
    ];
  }
}
