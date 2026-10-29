import { z } from 'zod';
import { APIError } from './errors';

const errorSchema = z.object({ error: z.object({ message: z.string(), code: z.string() }) });

async function request(url: string, signal: AbortSignal) {
  try {
    return await fetch(url, { signal, headers: { Accept: 'application/json' } });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new APIError('Could not connect. Please check your connection and try again.');
  }
}

function responseError(response: Response, body: unknown) {
  const parsed = errorSchema.safeParse(body);
  if (!parsed.success)
    return new APIError(
      'Unable to load this content. Please try again.',
      response.status,
      'request_failed',
    );
  return new APIError(parsed.data.error.message, response.status, parsed.data.error.code);
}

function parsePayload<T>(body: unknown, schema: z.ZodType<T>): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    throw new APIError(
      'This content could not be displayed. Please try again.',
      0,
      'invalid_response',
    );
  return parsed.data;
}

async function readResponse<T>(response: Response, schema: z.ZodType<T>) {
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw responseError(response, body);
  return parsePayload(body, schema);
}

export async function getJSON<T>(
  url: string,
  schema: z.ZodType<T>,
  signal: AbortSignal,
): Promise<T> {
  return readResponse(await request(url, signal), schema);
}
