import { CreateLedgerAccountOperation } from '../../../../application/operations/ledger/accounts/CreateLedgerAccountOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';

export const POST = withExecutionContext(
  withPermission(
    'ledger.account.write',
    withApiHandler(async (req, { executionContext }) => {
      const payload = await req.json();
      const result = await new CreateLedgerAccountOperation().execute(
        executionContext,
        payload
      );
      return Response.json(StandardResponse.success(result), { status: 201 });
    })
  )
);
