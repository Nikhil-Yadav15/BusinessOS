import { BaseOperation } from '../../BaseOperation.js';
import { JournalEntryRepository } from '../../../../persistence/repositories/JournalEntryRepository.js';
import { JournalLineRepository } from '../../../../persistence/repositories/JournalLineRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';
import { JournalEntryDto } from '../dto/JournalEntryDto.js';
import { validateDto } from '../../../common/ValidationUtils.js';

export class CreateJournalEntryOperation extends BaseOperation {
  async validate(context, input) {
    this.validatedData = validateDto(JournalEntryDto.create, input);
  }

  async perform(context, input, tx) {
    const { businessId, userId } = context;
    if (!businessId || !userId) throw new Error('businessId and userId are required');

    const { lines, ...entryHeader } = this.validatedData;

    // Zero-sum Validation: Total Debits must equal Total Credits
    let totalDebit = 0;
    let totalCredit = 0;
    
    for (const line of lines) {
      totalDebit += parseFloat(line.debitAmount);
      totalCredit += parseFloat(line.creditAmount);
    }
    
    // Math.abs handles floating point precision issues for exact zero-sum validation
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
       const err = new Error(`Double-entry system violation: Total Debits (${totalDebit}) must equal Total Credits (${totalCredit})`);
       err.status = 400;
       throw err;
    }

    // Auto-generate entry number (Date math simple ID for V1)
    const entryNumber = `JE-${Date.now()}${Math.floor(Math.random() * 100)}`;

    const formattedHeader = {
      ...entryHeader,
      entryNumber,
      businessId,
      createdBy: userId,
      entryDate: new Date(entryHeader.entryDate)
    };

    // 1. Insert Journal Entry Header
    const journalEntry = await JournalEntryRepository.create(formattedHeader, tx);

    // 2. Insert Journal Lines mapped to the Header
    const createdLines = [];
    for (const line of lines) {
      if (line.debitAmount === 0 && line.creditAmount === 0) continue; // Skip empty lines

      const formattedLine = {
        journalEntryId: journalEntry.id,
        ledgerAccountId: line.ledgerAccountId,
        debitAmount: String(line.debitAmount),
        creditAmount: String(line.creditAmount)
      };
      const createdLine = await JournalLineRepository.create(formattedLine, tx);
      createdLines.push(createdLine);
    }

    return { journalEntry, lines: createdLines };
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('ledger.journal.created', {
        businessId: context.businessId,
        aggregateId: result.journalEntry.id,
        entryNumber: result.journalEntry.entryNumber
      }, context)
    ];
  }
}
