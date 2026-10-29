import { useCallback, useEffect, useState } from 'react';
import type { z } from 'zod';
import { asAPIError, type APIError } from './errors';
import { getJSON } from './request';

export type Resource<T> = { data?: T; error?: APIError; loading: boolean; retry: () => void };
type ResourceResult<T> = { url: string | null; data?: T; error?: APIError };

function isLoading<T>(url: string | null, result: ResourceResult<T>) {
  return Boolean(url) && !result.data && !result.error;
}

export function useResource<T>(url: string | null, schema: z.ZodType<T>): Resource<T> {
  const [result, setResult] = useState<ResourceResult<T>>({ url: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    setResult({ url });
    getJSON(url, schema, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ url, data });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ url, error: asAPIError(error) });
      });
    // Abort obsolete requests so slow responses cannot replace the selected page.
    return () => controller.abort();
  }, [url, schema, attempt]);
  const current = result.url === url ? result : { url };
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { data: current.data, error: current.error, loading: isLoading(url, current), retry };
}
