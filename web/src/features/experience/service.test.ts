import { afterEach, expect, it, vi } from 'vitest';
import { getExperience } from './service';
import experience from '../../../../internal/data/experience.json';

afterEach(() => {
  vi.unstubAllGlobals();
});

it('loads and validates JSON with an Accept header', async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json(experience));
  const controller = new AbortController();

  vi.stubGlobal('fetch', fetch);
  await expect(getExperience(controller.signal)).resolves.toEqual({
    ok: true,
    data: experience,
  });

  expect(fetch).toHaveBeenCalledWith('/api/v1/experience', {
    signal: controller.signal,
    headers: { Accept: 'application/json' },
  });
});

it('preserves API error messages and status', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(Response.json({ error: { message: 'Try later' } }, { status: 503 })),
  );

  await expect(getExperience()).resolves.toMatchObject({
    ok: false,
    error: { message: 'Try later', status: 503 },
  });
});

it('handles errors without a JSON error envelope', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Bad gateway', { status: 502 })));

  await expect(getExperience()).resolves.toMatchObject({
    ok: false,
    error: { message: 'Unable to load this content. Please try again.', status: 502 },
  });
});

it.each([Response.json({ name: 123 }), new Response('invalid JSON')])(
  'returns an error for malformed successful responses',
  async (response) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

    await expect(getExperience()).resolves.toMatchObject({
      ok: false,
      error: {
        message: 'This content could not be displayed. Please try again.',
        status: 200,
      },
    });
  },
);

it('reports a network failure', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network unavailable')));

  await expect(getExperience()).resolves.toMatchObject({
    ok: false,
    error: { message: expect.stringMatching(/Could not connect/), status: null },
  });
});

it('preserves cancellation instead of turning it into a network error', async () => {
  const controller = new AbortController();
  const error = new DOMException('Aborted', 'AbortError');

  controller.abort();
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
  await expect(getExperience(controller.signal)).resolves.toMatchObject({
    ok: false,
    error: { message: 'Request cancelled.', status: null },
  });
});
