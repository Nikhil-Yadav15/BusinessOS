import { CreateJournalEntryOperation } from '../../../../application/operations/ledger/journal/CreateJournalEntryOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';
import { JournalEntryRepository } from '../../../../persistence/repositories/JournalEntryRepository.js';
import { JournalLineRepository } from '../../../../persistence/repositories/JournalLineRepository.js';

export const POST = withExecutionContext(
  withPermission(
    'ledger.journal.write',
    withApiHandler(async (req, { executionContext }) => {
      const payload = await req.json();
      const result = await new CreateJournalEntryOperation().execute(
        executionContext,
        payload
      );
      return Response.json(StandardResponse.success(result), { status: 201 });
    })
  )
);

export const GET = withExecutionContext(
  withPermission(
    'ledger.journal.read',
    withApiHandler(async (req, { executionContext }) => {
      // Just returns standard entries or lines to feed charts
      // To keep charts easily operational, we fetch the lines which have the credit/debit amount
      const result = await JournalLineRepository.findList({
        filters: { 'journalEntry.businessId': executionContext.businessId },
        limit: 500
      }).catch(async (e) => {
         // Fallback if relation filters fail, just fetch raw Journal entries
         return await JournalEntryRepository.findList({
            filters: { businessId: executionContext.businessId },
            limit: 500
         });
      });
      return Response.json(StandardResponse.success(result));
    })
  )
);
