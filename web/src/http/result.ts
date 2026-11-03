export type ApiError = {
  message: string;
  status: number | null;
};

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };
