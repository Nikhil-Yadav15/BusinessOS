export class ExecutionContext {
  constructor({ userId, sessionId, businessId, memberId, metadata }) {
    this.userId = userId;
    this.sessionId = sessionId;
    // Authoritative tenant data (server-validated)
    this.businessId = businessId; 
    this.memberId = memberId;     
    // Request & Observability Metadata
    this.metadata = metadata || {
      correlationId: null,
      ipAddress: null,
      userAgent: null,
    };
  }
}