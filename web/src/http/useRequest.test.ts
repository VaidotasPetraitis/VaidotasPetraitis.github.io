import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useRequest } from './useRequest';
import type { Result } from './result';

afterEach(cleanup);

it('loads once without refetching after the result changes', async () => {
  const request = vi.fn(async (): Promise<Result<string>> => ({ ok: true, data: 'Loaded' }));
  const { result } = renderHook(() => useRequest(request));

  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.data).toBe('Loaded'));
  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBeUndefined();
  expect(request).toHaveBeenCalledTimes(1);
});

it('retries after a returned error and clears that error on success', async () => {
  const request = vi
    .fn<() => Promise<Result<string>>>()
    .mockResolvedValueOnce({
      ok: false,
      error: { message: 'Try later', status: 503 },
    })
    .mockResolvedValueOnce({ ok: true, data: 'Recovered' });
  const { result } = renderHook(() => useRequest(request));

  await waitFor(() => expect(result.current.error?.message).toBe('Try later'));
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.data).toBe('Recovered'));
  expect(result.current.error).toBeUndefined();
  expect(request).toHaveBeenCalledTimes(2);
});

it('aborts the previous request and ignores its late result when inputs change', async () => {
  let finishFirst!: (result: Result<string>) => void;
  let firstSignal!: AbortSignal;

  const first = (signal: AbortSignal) => {
    firstSignal = signal;

    return new Promise<Result<string>>((resolve) => {
      finishFirst = resolve;
    });
  };

  const second = async (): Promise<Result<string>> => ({ ok: true, data: 'Second' });
  const { result, rerender } = renderHook(({ request }) => useRequest(request), {
    initialProps: { request: first },
  });

  rerender({ request: second });
  expect(firstSignal.aborted).toBe(true);
  await waitFor(() => expect(result.current.data).toBe('Second'));
  await act(async () => finishFirst({ ok: true, data: 'First' }));
  expect(result.current.data).toBe('Second');
});

it('aborts the request when its consumer unmounts', () => {
  let signal!: AbortSignal;

  const request = (requestSignal: AbortSignal) => {
    signal = requestSignal;

    return new Promise<Result<string>>(() => {});
  };

  const { unmount } = renderHook(() => useRequest(request));

  unmount();
  expect(signal.aborted).toBe(true);
});
