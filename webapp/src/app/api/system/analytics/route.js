import { GetAnalyticsSnapshotOperation } from '../../../../application/operations/analytics/GetAnalyticsSnapshotOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';

export const GET = withExecutionContext(
    withApiHandler(async (req, { executionContext }) => {
      // Intentionally decoupled from a rigid permission here for generic Dashboard overview access (or read it from the JWT context globally)
      const result = await new GetAnalyticsSnapshotOperation().execute(
        executionContext,
        {} // Uses "BUSINESS_SUMMARY" default map
      );
      return Response.json(StandardResponse.success(result));
    })
);
