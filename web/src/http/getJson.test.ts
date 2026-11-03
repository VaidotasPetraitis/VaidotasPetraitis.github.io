import { afterEach, expect, it, vi } from 'vitest';
import { getJson } from './getJson';
import { z } from 'zod';

afterEach(() => vi.unstubAllGlobals());

it('returns validated data as a typed result', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ name: 'Profile' })));
  const controller = new AbortController();
  const result = await getJson('/profile', z.object({ name: z.string() }), controller.signal);

  expect(result.ok).toBe(true);

  if (result.ok) {
    expect(result.data.name).toBe('Profile');
  }
});

it('keeps valid JSON null distinct from malformed JSON', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(null)));
  await expect(getJson('/nullable', z.null())).resolves.toEqual({
    ok: true,
    data: null,
  });
});

it('reports cancellation even when fetch resolves after being aborted', async () => {
  let finish!: (response: Response) => void;
  const controller = new AbortController();

  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    ),
  );

  const request = getJson('/slow', z.unknown(), controller.signal);

  controller.abort();
  finish(Response.json({ value: 'Late' }));
  await expect(request).resolves.toMatchObject({
    ok: false,
    error: { message: 'Request cancelled.', status: null },
  });
});

it('returns cancellation when native fetch rejects on abort', async () => {
  const controller = new AbortController();

  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(
      (_url, options: RequestInit) =>
        new Promise((_resolve, reject) => {
          options.signal!.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    ),
  );

  const request = getJson('/slow', z.unknown(), controller.signal);

  controller.abort();
  await expect(request).resolves.toMatchObject({
    ok: false,
    error: { message: 'Request cancelled.', status: null },
  });
});
