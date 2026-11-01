import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { z } from 'zod';
import { apiQuery } from './api';

const schema = z.object({ name: z.string() });
let client: QueryClient;

beforeEach(() => {
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 5 * 60 * 1000 } },
  });
});

function wrapper(props: { children: ReactNode }) {
  return <QueryClientProvider client={client}>{props.children}</QueryClientProvider>;
}

afterEach(() => {
  cleanup();
  client.clear();
  vi.unstubAllGlobals();
});

it('loads and validates JSON with an Accept header', async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json({ name: 'Profile' }));

  vi.stubGlobal('fetch', fetch);
  const { result } = renderHook(() => useQuery(apiQuery('/profile', schema)), { wrapper });

  expect(result.current.isLoading).toBe(true);
  await waitFor(() => expect(result.current.data).toEqual({ name: 'Profile' }));
  expect(result.current.isLoading).toBe(false);
  expect(fetch.mock.calls[0][1].headers).toEqual({ Accept: 'application/json' });
});

it('waits until enabled before requesting data', async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json({ name: 'Current' }));

  vi.stubGlobal('fetch', fetch);
  const { result, rerender } = renderHook(
    ({ enabled }) => useQuery({ ...apiQuery('/profile', schema), enabled }),
    { initialProps: { enabled: false }, wrapper },
  );

  expect(fetch).not.toHaveBeenCalled();
  expect(result.current.isLoading).toBe(false);
  rerender({ enabled: true });
  await waitFor(() => expect(result.current.data).toEqual({ name: 'Current' }));
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('preserves API status and retries after an API failure', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ error: { message: 'Try later' } }, { status: 503 }))
    .mockResolvedValueOnce(Response.json({ name: 'Recovered' }));

  vi.stubGlobal('fetch', fetch);
  const { result } = renderHook(() => useQuery(apiQuery('/profile', schema)), { wrapper });

  await waitFor(() => expect(result.current.error?.status).toBe(503));
  expect(result.current.error?.message).toBe('Try later');
  act(() => void result.current.refetch());
  await waitFor(() => expect(result.current.data?.name).toBe('Recovered'));
  expect(result.current.error).toBeNull();
});

it('handles errors without a JSON error envelope', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Bad gateway', { status: 502 })));
  const { result } = renderHook(() => useQuery(apiQuery('/profile', schema)), { wrapper });

  await waitFor(() =>
    expect(result.current.error?.message).toBe('Unable to load this content. Please try again.'),
  );

  expect(result.current.error?.status).toBe(502);
});

it('rejects malformed successful responses', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ name: 123 })));
  const { result } = renderHook(() => useQuery(apiQuery('/profile', schema)), { wrapper });

  await waitFor(() =>
    expect(result.current.error?.message).toBe(
      'This content could not be displayed. Please try again.',
    ),
  );

  expect(result.current.data).toBeUndefined();
});

it('reports a network failure', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network unavailable')));
  const { result } = renderHook(() => useQuery(apiQuery('/profile', schema)), { wrapper });

  await waitFor(() => expect(result.current.error?.message).toMatch(/Could not connect/));
});

it('aborts obsolete requests and ignores late responses', async () => {
  let finishFirst!: (response: Response) => void;
  const fetch = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          finishFirst = resolve;
        }),
    )
    .mockResolvedValueOnce(Response.json({ name: 'Second' }));

  vi.stubGlobal('fetch', fetch);
  const { result, rerender, unmount } = renderHook(({ url }) => useQuery(apiQuery(url, schema)), {
    wrapper,
    initialProps: { url: '/first' },
  });
  const firstSignal = fetch.mock.calls[0][1].signal;

  rerender({ url: '/second' });
  expect(firstSignal.aborted).toBe(true);
  await waitFor(() => expect(result.current.data?.name).toBe('Second'));
  await act(async () => finishFirst(Response.json({ name: 'First' })));
  expect(result.current.data?.name).toBe('Second');
  unmount();
});

it('ignores abort rejections from obsolete requests', async () => {
  const fetch = vi
    .fn()
    .mockImplementation(
      (_url: string, { signal }: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) =>
          signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))),
        ),
    );

  vi.stubGlobal('fetch', fetch);
  const { unmount } = renderHook(() => useQuery(apiQuery('/profile', schema)), { wrapper });

  await act(async () => unmount());
  expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
});

it('reuses cached data and shares requests between consumers', async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json({ name: 'Cached' }));

  vi.stubGlobal('fetch', fetch);
  const first = renderHook(() => useQuery(apiQuery('/profile', schema)), { wrapper });
  const second = renderHook(() => useQuery(apiQuery('/profile', schema)), { wrapper });

  await waitFor(() => expect(first.result.current.data?.name).toBe('Cached'));
  await waitFor(() => expect(second.result.current.data?.name).toBe('Cached'));
  first.unmount();
  second.unmount();
  const returning = renderHook(() => useQuery(apiQuery('/profile', schema)), { wrapper });

  expect(returning.result.current.data?.name).toBe('Cached');
  expect(fetch).toHaveBeenCalledTimes(1);
});
