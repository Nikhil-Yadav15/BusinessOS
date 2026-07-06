import { GetInvoiceOperation } from '../../../../../application/operations/sales/invoices/GetInvoiceOperation.js';
import { withExecutionContext } from '../../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../../application/common/StandardResponse.js';

export const GET = withExecutionContext(
  withPermission(
    'sales.invoice.read',
    withApiHandler(async (req, { executionContext, params }) => {
      const result = await new GetInvoiceOperation().execute(
        executionContext,
        { id: params.id }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);
