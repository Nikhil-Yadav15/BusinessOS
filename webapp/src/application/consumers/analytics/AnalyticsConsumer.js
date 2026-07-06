import { AnalyticsSnapshotRepository } from '../../../persistence/repositories/AnalyticsSnapshotRepository.js';

// Seeded implicitly via initial schemas
const SUMMARY_CODE = 'BUSINESS_SUMMARY';

export class AnalyticsConsumer {
  getSubscribedEvents() {
    return [
      'sales.invoice.created',
      'ledger.journal.created'
    ];
  }

  async handle(event, tx) {
    if (!event.businessId) return;

    if (event.eventType === 'sales.invoice.created') {
       await this.updateSalesAggregate(event, tx);
    }
    
    // Future logic: Ledger analytics could track dynamic liabilities etc.
  }

  async updateSalesAggregate(event, tx) {
    const { businessId, payload } = event;
    const invoiceTotal = parseFloat(payload.totalAmount || 0);

    // 1. Resolve Snapshot Type ID globally
    const snapshotTypeId = await AnalyticsSnapshotRepository.getTypeIdByCode(SUMMARY_CODE, tx);
    if (!snapshotTypeId) return; // Prevent crashes if seed didn't map type

    // 2. Fetch existing daily/global analytics tracking struct
    let snapshot = await AnalyticsSnapshotRepository.findLatestSnapshot(businessId, snapshotTypeId, tx);

    if (snapshot) {
       // Math tracking natively inside the JSONB structure
       const currentData = snapshot.data || {};
       const newRevenueTotal = parseFloat(currentData.totalSalesRevenue || 0) + invoiceTotal;
       const newInvoiceCount = parseInt(currentData.totalInvoices || 0) + 1;

       const updatedData = {
          ...currentData,
          totalSalesRevenue: String(newRevenueTotal.toFixed(2)),
          totalInvoices: newInvoiceCount,
          lastInvoiceAt: new Date().toISOString()
       };

       await AnalyticsSnapshotRepository.update(snapshot.id, {
         version: snapshot.version + 1,
         data: updatedData,
         updatedAt: new Date()
       }, tx);
       
    } else {
       // Scaffold baseline on day 1 logic
       const initialData = {
          totalSalesRevenue: String(invoiceTotal.toFixed(2)),
          totalInvoices: 1,
          lastInvoiceAt: new Date().toISOString()
       };

       await AnalyticsSnapshotRepository.create({
         businessId,
         snapshotTypeId,
         version: 1,
         data: initialData
       }, tx);
    }
  }
}
