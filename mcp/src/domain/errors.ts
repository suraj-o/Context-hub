/**
 * Domain error hierarchy.
 * All application errors extend AppError for consistent handling.
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super("NOT_FOUND", `${resource} with id '${id}' not found`, 404);
    this.name = "NotFoundError";
  }
}

export class DuplicateError extends AppError {
  public readonly contentHash: string;

  constructor(contentHash: string) {
    super("DUPLICATE", `Content already exists (hash: ${contentHash})`, 409);
    this.name = "DuplicateError";
    this.contentHash = contentHash;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super("VALIDATION_ERROR", message, 400);
    this.name = "ValidationError";
  }
}

export class NoiseContentError extends AppError {
  constructor(reason: string) {
    super("NOISE_CONTENT", `Content filtered as noise: ${reason}`, 422);
    this.name = "NoiseContentError";
  }
}
