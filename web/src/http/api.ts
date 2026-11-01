import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

export type APIError = Error & { status: number };

const errorSchema = z.object({ error: z.object({ message: z.string() }) });

function apiError(message: string, status = 0): APIError {
  return Object.assign(new Error(message), { status });
}

async function request(url: string, signal: AbortSignal) {
  try {
    return await fetch(url, { signal, headers: { Accept: 'application/json' } });
  } catch (error) {
    if (signal.aborted) {
      throw error;
    }

    throw apiError('Could not connect. Please check your connection and try again.');
  }
}

function responseError(body: unknown, status: number) {
  const parsed = errorSchema.safeParse(body);

  if (parsed.success) {
    return apiError(parsed.data.error.message, status);
  }

  return apiError('Unable to load this content. Please try again.', status);
}

async function fetchData<T>(url: string, schema: z.ZodType<T>, signal: AbortSignal): Promise<T> {
  const response = await request(url, signal);
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw responseError(body, response.status);
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    throw apiError('This content could not be displayed. Please try again.');
  }

  return parsed.data;
}

export function apiQuery<T>(url: string, schema: z.ZodType<T>) {
  return queryOptions<T, APIError>({
    queryKey: [url],
    queryFn: ({ signal }) => fetchData(url, schema, signal),
  });
}
