import { BaseOperation } from '../BaseOperation.js';
import { AnalyticsSnapshotRepository } from '../../../persistence/repositories/AnalyticsSnapshotRepository.js';

export class GetAnalyticsSnapshotOperation extends BaseOperation {
  async perform(context, input, tx) {
    const { businessId } = context;
    const { code = 'BUSINESS_SUMMARY' } = input || {};

    const typeId = await AnalyticsSnapshotRepository.getTypeIdByCode(code, tx);
    if (!typeId) {
       return { data: {} }; // Return empty safety struct if type doesn't exist
    }

    const snapshot = await AnalyticsSnapshotRepository.findLatestSnapshot(businessId, typeId, tx);
    
    return snapshot ? snapshot : { data: {} };
  }

  createEvents() { return []; }
}
