export class APIError extends Error {
  constructor(
    message: string,
    public status = 0,
    public code = 'network_error',
  ) {
    super(message);
  }
}

export function asAPIError(error: unknown) {
  return error instanceof APIError ? error : new APIError('Unable to load this content.');
}
