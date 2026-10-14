export type ApiErrorPayload = {
  message: string;
  error: string;
  statusCode: number;
};

export class ApiError extends Error {
  readonly error: string;
  readonly statusCode: number;

  constructor({ message, error, statusCode }: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.error = error;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
