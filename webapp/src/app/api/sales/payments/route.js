import { RecordPaymentOperation } from '../../../../application/operations/sales/payments/RecordPaymentOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';

export const POST = withExecutionContext(
  withPermission(
    'sales.payment.write',
    withApiHandler(async (req, { executionContext }) => {
      const payload = await req.json();
      
      const result = await new RecordPaymentOperation().execute(
        executionContext,
        payload
      );

      return Response.json(StandardResponse.success(result), { status: 201 });
    })
  )
);
