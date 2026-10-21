export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}
export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") { super(message, 401); this.name = "UnauthorizedError"; }
}
export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") { super(message, 403); this.name = "ForbiddenError"; }
}

// Strapi ValidationError: { error: { details: { errors: [{ path: ["title"], message }] } } }
export function extractFieldErrors(error: ApiError): FieldErrors {
  const list = (error.details as { errors?: { path?: string[]; message: string }[] } | undefined)?.errors ?? [];
  const out: FieldErrors = {};
  for (const e of list) {
    const key = e.path?.[0];
    if (key && !out[key]) out[key] = e.message;
  }
  return out;
}