import { RecordSupplierPaymentOperation } from '../../../../application/operations/purchasing/payments/RecordSupplierPaymentOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';

export const POST = withExecutionContext(
  withPermission(
    'purchasing.payment.write',
    withApiHandler(async (req, { executionContext }) => {
      const payload = await req.json();
      
      const result = await new RecordSupplierPaymentOperation().execute(
        executionContext,
        payload
      );

      return Response.json(StandardResponse.success(result), { status: 201 });
    })
  )
);
