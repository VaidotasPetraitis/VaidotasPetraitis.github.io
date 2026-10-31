import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { APIError, asAPIError } from './ApiError';

export type FetchData<T> = {
  data?: T;
  error?: APIError;
  loading: boolean;
  retry: () => void;
};

const errorSchema = z.object({ error: z.object({ message: z.string() }) });

async function request(url: string, signal: AbortSignal) {
  try {
    return await fetch(url, { signal, headers: { Accept: 'application/json' } });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new APIError('Could not connect. Please check your connection and try again.');
  }
}

function responseError(body: unknown, status: number) {
  const parsed = errorSchema.safeParse(body);
  if (parsed.success) return new APIError(parsed.data.error.message, status);
  return new APIError('Unable to load this content. Please try again.', status);
}

async function fetchData<T>(url: string, schema: z.ZodType<T>, signal: AbortSignal): Promise<T> {
  const response = await request(url, signal);
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw responseError(body, response.status);

  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new APIError('This content could not be displayed. Please try again.');
  return parsed.data;
}

export function useFetchData<T>(url: string, schema: z.ZodType<T>): FetchData<T> {
  const [result, setResult] = useState<{ url: string; data?: T; error?: APIError }>({ url: '' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setResult({ url });
    fetchData(url, schema, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ url, data });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult({ url, error: asAPIError(error) });
      });
    return () => controller.abort();
  }, [url, schema, attempt]);

  const current = result.url === url ? result : { url };
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { ...current, loading: current.data === undefined && !current.error, retry };
}
