import { useEffect, useReducer, useState } from 'react';
import type { ApiError, Result } from './result';

export type RequestState<T> = {
  data?: T;
  error?: ApiError;
  loading: boolean;
  retry: () => void;
};

export function useRequest<T>(
  request: (signal: AbortSignal) => Promise<Result<T>>,
): RequestState<T> {
  const [result, setResult] = useState<Result<T> | null>(null);
  const [attempt, retry] = useReducer((value: number) => value + 1, 0);

  useEffect(() => {
    const controller = new AbortController();

    setResult(null);

    async function load() {
      const response = await request(controller.signal);

      if (!controller.signal.aborted) {
        setResult(response);
      }
    }

    void load();

    return () => controller.abort();
  }, [request, attempt]);

  if (result?.ok) {
    return { data: result.data, error: undefined, loading: false, retry };
  }

  return {
    data: undefined,
    error: result?.error,
    loading: result === null,
    retry,
  };
}
