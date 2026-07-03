export class ExecutionContext {
  constructor({ userId, sessionId, businessId, memberId }) {
    this.userId = userId;
    this.sessionId = sessionId;
    this.businessId = businessId; // Can be null for tenant-agnostic operations
    this.memberId = memberId;     // Can be null for tenant-agnostic operations
  }
}