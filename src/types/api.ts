export type ApiResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorShape = {
  code: string;
  message: string;
  message_key?: string;
  details?: Record<string, unknown>;
  field_errors?: Record<string, string>;
};

export class ApiException extends Error {
  constructor(public readonly error: ApiErrorShape) {
    super(error.message);
    this.name = 'ApiException';
  }

  get hasFieldErrors(): boolean {
    return !!this.error.field_errors && Object.keys(this.error.field_errors).length > 0;
  }
}
