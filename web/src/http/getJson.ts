import { z } from 'zod';
import type { Result } from './result';

const errorSchema = z.object({ error: z.object({ message: z.string() }) });

function failure(message: string, status: number | null = null): Result<never> {
  return { ok: false, error: { message, status } };
}

function responseFailure(body: unknown, status: number): Result<never> {
  const parsed = errorSchema.safeParse(body);
  const message = parsed.success
    ? parsed.data.error.message
    : 'Unable to load this content. Please try again.';

  return failure(message, status);
}

function decodeResponse<T>(response: Response, body: unknown, schema: z.ZodType<T>): Result<T> {
  if (!response.ok) {
    return responseFailure(body, response.status);
  }

  const parsed = schema.safeParse(body);

  if (body === undefined || !parsed.success) {
    return failure('This content could not be displayed. Please try again.', response.status);
  }

  return { ok: true, data: parsed.data };
}

async function fetchJson<T>(url: string, schema: z.ZodType<T>, signal?: AbortSignal) {
  signal?.throwIfAborted();
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  const body: unknown = await response.json().catch(() => undefined);

  signal?.throwIfAborted();

  return decodeResponse(response, body, schema);
}

export async function getJson<T>(
  url: string,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
): Promise<Result<T>> {
  try {
    return await fetchJson(url, schema, signal);
  } catch {
    if (signal?.aborted) {
      return failure('Request cancelled.');
    }

    return failure('Could not connect. Please check your connection and try again.');
  }
}
