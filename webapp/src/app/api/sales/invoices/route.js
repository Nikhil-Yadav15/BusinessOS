import { ListInvoicesOperation } from '../../../../application/operations/sales/invoices/ListInvoicesOperation.js';
import { CreateInvoiceOperation } from '../../../../application/operations/sales/invoices/CreateInvoiceOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';

export const GET = withExecutionContext(
  withPermission(
    'sales.invoice.read',
    withApiHandler(async (req, { executionContext }) => {
      const { searchParams } = new URL(req.url);
      
      const result = await new ListInvoicesOperation().execute(
        executionContext,
        {
          page: searchParams.get('page') || undefined,
          limit: searchParams.get('limit') || undefined,
          sortBy: searchParams.get('sortBy') || undefined,
          sortOrder: searchParams.get('sortOrder') || undefined,
          filters: {
            status: searchParams.get('status') || undefined,
            customerId: searchParams.get('customerId') || undefined
          }
        }
      );

      return Response.json(StandardResponse.success(result));
    })
  )
);

export const POST = withExecutionContext(
  withPermission(
    'sales.invoice.write',
    withApiHandler(async (req, { executionContext }) => {
      const payload = await req.json();
      const result = await new CreateInvoiceOperation().execute(
        executionContext,
        payload
      );
      return Response.json(StandardResponse.success(result), { status: 201 });
    })
  )
);
