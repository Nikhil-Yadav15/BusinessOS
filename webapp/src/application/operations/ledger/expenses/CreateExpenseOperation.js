import { BaseOperation } from '../../BaseOperation.js';
import { ExpenseRepository } from '../../../../persistence/repositories/ExpenseRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';
import { ExpenseDto } from '../dto/ExpenseDto.js';
import { validateDto } from '../../../common/ValidationUtils.js';

export class CreateExpenseOperation extends BaseOperation {
  async validate(context, input) {
    this.validatedData = validateDto(ExpenseDto.create, input);
  }

  async perform(context, input, tx) {
    const { businessId, userId } = context;
    if (!businessId || !userId) throw new Error('businessId and userId are required');

    // Convert decimal to string
    const formattedData = {
      ...this.validatedData,
      businessId,
      createdBy: userId,
      expenseDate: new Date(this.validatedData.expenseDate),
      amount: String(this.validatedData.amount)
    };

    const expense = await ExpenseRepository.create(formattedData, tx);

    return expense;
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('ledger.expense.created', {
        businessId: context.businessId,
        aggregateId: result.id,
        amount: result.amount
      }, context)
    ];
  }
}
