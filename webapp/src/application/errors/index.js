export class ApplicationError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}

export class ValidationError extends ApplicationError {
  constructor(message) { super(message, 400); }
}

export class AuthenticationError extends ApplicationError {
  constructor(message) { super(message, 401); }
}

export class AuthorizationError extends ApplicationError {
  constructor(message) { super(message, 403); }
}

export class ConflictError extends ApplicationError {
  constructor(message) { super(message, 409); }
}

export class BusinessRuleError extends ApplicationError {
  constructor(message) { super(message, 422); }
}