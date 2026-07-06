import { CreateExpenseOperation } from '../../../../application/operations/ledger/expenses/CreateExpenseOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';

export const POST = withExecutionContext(
  // Re-using journal.write as expenses are fundamentally accounting ledger entries
  withPermission(
    'ledger.journal.write',
    withApiHandler(async (req, { executionContext }) => {
      const payload = await req.json();
      const result = await new CreateExpenseOperation().execute(
        executionContext,
        payload
      );
      return Response.json(StandardResponse.success(result), { status: 201 });
    })
  )
);
