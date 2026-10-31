import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from './App';
import profile from '../../../internal/data/profile.json';
import experience from '../../../internal/data/experience.json';
import certifications from '../../../internal/data/certifications.json';
import projects from '../../../internal/data/projects.json';
import explorer from '../../../internal/data/explorer.json';

const content: Record<string, unknown> = {
  '/api/v1/profile': profile,
  '/api/v1/experience': experience,
  '/api/v1/certifications': certifications,
  '/api/v1/projects': projects,
  '/api/v1/explorer': explorer,
};

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  window.scrollTo = vi.fn();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url in content) return Response.json(content[url]);
      const project = projects.find((project) => url === `/api/v1/projects/${project.slug}`);
      if (project) return Response.json(project);
      return Response.json({ error: { message: 'Project not found.' } }, { status: 404 });
    }),
  );
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('renders About and only fetches layout data initially', async () => {
  render(<App />);
  await screen.findByText(profile.role);
  expect(document.title).toBe('About me · Vaidotas Petraitis');
  const urls = vi.mocked(fetch).mock.calls.map(([url]) => url);
  expect(urls).toEqual(['/api/v1/profile', '/api/v1/explorer', '/api/v1/projects']);
  const portrait = screen.getByRole('img', { name: profile.portraitAlt });
  expect(portrait.getAttribute('src')).toBe(profile.portrait);
});

it('navigates to Experience and focuses its loaded heading', async () => {
  render(<App />);
  await screen.findByText(profile.role);
  fireEvent.click(screen.getByRole('link', { name: 'Experience' }));
  await screen.findByRole('heading', { name: experience[0].role });
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Experience' })),
  );
  expect(window.location.search).toBe('?section=experience');
  expect(document.title).toBe('Experience · Vaidotas Petraitis');
  expect(vi.mocked(fetch).mock.calls.some(([url]) => url === '/api/v1/certifications')).toBe(false);
  act(() => {
    window.history.replaceState(null, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'About me' })),
  );
});

it('renders credentials and their verification links', async () => {
  window.history.replaceState(null, '', '/?section=certifications');
  render(<App />);
  await screen.findByRole('heading', { name: certifications[0].title });
  expect(document.title).toBe('Certifications · Vaidotas Petraitis');
  expect(screen.getAllByRole('link', { name: /View .* credential/ })[0].getAttribute('href')).toBe(
    certifications[0].url,
  );
});

it('loads project details, expands ancestors and operates the screenshot gallery', async () => {
  render(<App />);
  await screen.findByRole('link', { name: 'Quiz' });
  fireEvent.click(screen.getByRole('link', { name: 'Quiz' }));
  await screen.findByRole('heading', { name: 'Core capabilities' });
  expect(document.title).toBe('Quiz · Vaidotas Petraitis');
  expect(screen.getByRole('link', { name: 'Quiz' }).getAttribute('aria-current')).toBe('page');
  const buttons = screen.getAllByRole('button', { name: /^Enlarge / });
  fireEvent.click(buttons[0]);
  const dialog = screen.getByRole('dialog', { name: 'Project screenshot' });
  expect(within(dialog).getByText('1 / 4')).toBeTruthy();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Next screenshot' }));
  expect(within(dialog).getByText('2 / 4')).toBeTruthy();
  fireEvent.keyDown(document, { key: 'ArrowLeft' });
  expect(within(dialog).getByText('1 / 4')).toBeTruthy();
  fireEvent.keyDown(document, { key: 'ArrowRight' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Previous screenshot' }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Close screenshot' }));
  expect(dialog.hasAttribute('open')).toBe(false);
  fireEvent.keyDown(document, { key: 'ArrowRight' });
  fireEvent.click(buttons[1]);
  fireEvent.click(dialog);
  expect(dialog.hasAttribute('open')).toBe(false);
});

it('shows project 404s and a link back to About', async () => {
  window.history.replaceState(null, '', '/projects/missing');
  render(<App />);
  await screen.findByRole('heading', { name: 'Project not found' });
  await waitFor(() => expect(document.title).toBe('Project not found · Vaidotas Petraitis'));
  fireEvent.click(screen.getByRole('link', { name: 'Return to About' }));
  await screen.findByText(profile.role);
});

it('shows unknown routes without making a project request', async () => {
  window.history.replaceState(null, '', '/unknown');
  render(<App />);
  await screen.findByRole('heading', { name: 'Page not found' });
  expect(document.title).toBe('Page not found · Vaidotas Petraitis');
});

it('shows loading and error feedback and retries the profile', async () => {
  const stub = vi.mocked(fetch);
  const normalFetch = stub.getMockImplementation()!;
  stub.mockImplementationOnce(async () =>
    Response.json({ error: { message: 'Temporarily unavailable' } }, { status: 503 }),
  );
  render(<App />);
  const main = screen.getByRole('main');
  expect(within(main).getByRole('status')).toBeTruthy();
  await within(main).findByText('Temporarily unavailable');
  stub.mockImplementation(normalFetch);
  fireEvent.click(within(main).getByRole('button', { name: 'Try again' }));
  await screen.findByText(profile.role);
});

it('keeps mobile disclosure state and closes it after selection', async () => {
  render(<App />);
  await screen.findByText(profile.role);
  const toggle = screen.getByRole('button', { name: /Browse portfolio/ });
  fireEvent.click(toggle);
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  fireEvent.click(screen.getByRole('link', { name: 'Experience' }));
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  await screen.findByRole('heading', { name: experience[0].role });
});

it('collapses and reopens the project tree', async () => {
  render(<App />);
  await screen.findByRole('link', { name: 'Quiz' });
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
  expect(screen.queryByRole('link', { name: 'Quiz' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
  expect(screen.getByRole('link', { name: 'Quiz' })).toBeTruthy();
});

it.each(projects.map((project) => [project.slug, project.title]))(
  'renders the %s project',
  async (slug, title) => {
    window.history.replaceState(null, '', `/projects/${slug}`);
    render(<App />);
    await screen.findByRole('heading', { name: 'Core capabilities' });
    expect(screen.getByRole('heading', { name: title })).toBeTruthy();
    await waitFor(() => expect(document.title).toBe(`${title} · Vaidotas Petraitis`));
  },
);
