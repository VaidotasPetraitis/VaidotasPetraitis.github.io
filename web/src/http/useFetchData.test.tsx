import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { useFetchData } from './useFetchData';

const schema = z.object({ name: z.string() });

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('loads and validates JSON with an Accept header', async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json({ name: 'Profile' }));
  vi.stubGlobal('fetch', fetch);
  const { result } = renderHook(() => useFetchData('/profile', schema));
  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.data).toEqual({ name: 'Profile' }));
  expect(result.current.loading).toBe(false);
  expect(fetch.mock.calls[0][1].headers).toEqual({ Accept: 'application/json' });
});

it('preserves API status and retries after an API failure', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ error: { message: 'Try later' } }, { status: 503 }))
    .mockResolvedValueOnce(Response.json({ name: 'Recovered' }));
  vi.stubGlobal('fetch', fetch);
  const { result } = renderHook(() => useFetchData('/profile', schema));
  await waitFor(() => expect(result.current.error?.status).toBe(503));
  expect(result.current.error?.message).toBe('Try later');
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.data?.name).toBe('Recovered'));
  expect(result.current.error).toBeUndefined();
});

it('handles errors without a JSON error envelope', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Bad gateway', { status: 502 })));
  const { result } = renderHook(() => useFetchData('/profile', schema));
  await waitFor(() =>
    expect(result.current.error?.message).toBe('Unable to load this content. Please try again.'),
  );
  expect(result.current.error?.status).toBe(502);
});

it('rejects malformed successful responses', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ name: 123 })));
  const { result } = renderHook(() => useFetchData('/profile', schema));
  await waitFor(() =>
    expect(result.current.error?.message).toBe(
      'This content could not be displayed. Please try again.',
    ),
  );
  expect(result.current.data).toBeUndefined();
});

it('reports a network failure', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network unavailable')));
  const { result } = renderHook(() => useFetchData('/profile', schema));
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
  const { result, rerender, unmount } = renderHook(({ url }) => useFetchData(url, schema), {
    initialProps: { url: '/first' },
  });
  const firstSignal = fetch.mock.calls[0][1].signal;
  rerender({ url: '/second' });
  expect(firstSignal.aborted).toBe(true);
  await waitFor(() => expect(result.current.data?.name).toBe('Second'));
  await act(async () => finishFirst(Response.json({ name: 'First' })));
  expect(result.current.data?.name).toBe('Second');
  const secondSignal = fetch.mock.calls[1][1].signal;
  unmount();
  expect(secondSignal.aborted).toBe(true);
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
  const { unmount } = renderHook(() => useFetchData('/profile', schema));
  await act(async () => unmount());
  expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
});
