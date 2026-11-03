import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router';
import { StrictMode } from 'react';
import App from './App';
import profile from '../../../internal/data/profile.json';
import experience from '../../../internal/data/experience.json';
import certifications from '../../../internal/data/certifications.json';
import projects from '../../../internal/data/projects.json';
import explorer from '../../../internal/data/explorer.json';

function renderApp() {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}

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
      if (url in content) {
        return Response.json(content[url]);
      }

      const project = projects.find((project) => url === `/api/v1/projects/${project.slug}`);

      if (project) {
        return Response.json(project);
      }

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
  renderApp();
  await screen.findByText(profile.role);
  expect(document.title).toBe('About me · Vaidotas Petraitis');
  const urls = vi.mocked(fetch).mock.calls.map(([url]) => url);

  expect(urls.sort()).toEqual(['/api/v1/explorer', '/api/v1/profile', '/api/v1/projects']);
  const portrait = screen.getByRole('img', { name: profile.portraitAlt });

  expect(portrait.getAttribute('src')).toBe(profile.portrait);
});

it('navigates without reloading and focuses the main content', async () => {
  renderApp();
  await screen.findByText(profile.role);
  const header = screen.getByRole('banner');
  const main = screen.getByRole('main');
  const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });

  fireEvent(screen.getByRole('link', { name: 'Experience' }), click);
  expect(click.defaultPrevented).toBe(true);
  expect(document.activeElement).toBe(main);
  await screen.findByRole('heading', { name: experience[0].role });
  expect(screen.getByRole('banner')).toBe(header);
  expect(document.activeElement).toBe(main);
  expect(window.location.pathname).toBe('/experience');
  expect(window.location.search).toBe('');
  expect(screen.getByRole('link', { name: 'Experience' }).getAttribute('aria-current')).toBe(
    'page',
  );

  expect(document.title).toBe('Experience · Vaidotas Petraitis');
  expect(vi.mocked(fetch).mock.calls.some(([url]) => url === '/api/v1/certifications')).toBe(false);
  await act(async () => {
    const navigated = new Promise((resolve) =>
      window.addEventListener('popstate', resolve, { once: true }),
    );

    window.history.back();
    await navigated;
  });

  await screen.findByText(profile.role);
  expect(document.activeElement).toBe(main);
  expect(document.title).toBe('About me · Vaidotas Petraitis');

  await act(async () => {
    const navigated = new Promise((resolve) =>
      window.addEventListener('popstate', resolve, { once: true }),
    );

    window.history.forward();
    await navigated;
  });

  await screen.findByRole('heading', { name: experience[0].role });
  expect(document.title).toBe('Experience · Vaidotas Petraitis');
  expect(screen.getByRole('banner')).toBe(header);
});

it('renders credentials and their verification links', async () => {
  window.history.replaceState(null, '', '/certifications');
  renderApp();
  await screen.findByRole('heading', { name: certifications[0].title });
  expect(document.title).toBe('Certifications · Vaidotas Petraitis');
  expect(screen.getAllByRole('link', { name: /View .* credential/ })[0].getAttribute('href')).toBe(
    certifications[0].url,
  );
});

it('loads project details, expands ancestors and operates the screenshot gallery', async () => {
  renderApp();
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
  fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
  expect(within(dialog).getByText('1 / 4')).toBeTruthy();
  fireEvent.keyDown(dialog, { key: 'ArrowRight' });
  expect(within(dialog).getByText('2 / 4')).toBeTruthy();
  fireEvent.keyDown(dialog, { key: 'Enter' });
  expect(within(dialog).getByText('2 / 4')).toBeTruthy();
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
  renderApp();
  await screen.findByRole('heading', { name: 'Project not found' });
  await waitFor(() => expect(document.title).toBe('Project not found · Vaidotas Petraitis'));
  fireEvent.click(screen.getByRole('link', { name: 'Return to About' }));
  await screen.findByText(profile.role);
});

it('uses the loaded project title even when project summaries fail', async () => {
  const normalFetch = vi.mocked(fetch).getMockImplementation()!;

  vi.mocked(fetch).mockImplementation(async (url) => {
    if (url === '/api/v1/projects') {
      return Response.json({ error: { message: 'Summaries unavailable' } }, { status: 503 });
    }

    if (url === '/api/v1/projects/quiz') {
      return Response.json({
        ...projects.find((project) => project.slug === 'quiz'),
        title: 'Quiz from project details',
      });
    }

    return normalFetch(url);
  });

  window.history.replaceState(null, '', '/projects/quiz');
  renderApp();
  await screen.findByRole('heading', { name: 'Quiz from project details' });
  await waitFor(() =>
    expect(document.title).toBe('Quiz from project details · Vaidotas Petraitis'),
  );

  expect(
    await screen.findByRole('button', { name: /^Browse portfolio\s*Quiz from project details$/ }),
  ).toBeTruthy();
});

it('uses the project not-found title even when its summary exists', async () => {
  const normalFetch = vi.mocked(fetch).getMockImplementation()!;

  vi.mocked(fetch).mockImplementation(async (url) => {
    if (url === '/api/v1/projects/quiz') {
      return Response.json({ error: { message: 'Project not found.' } }, { status: 404 });
    }

    return normalFetch(url);
  });

  window.history.replaceState(null, '', '/projects/quiz');
  renderApp();
  await screen.findByRole('heading', { name: 'Project not found' });
  await waitFor(() => expect(document.title).toBe('Project not found · Vaidotas Petraitis'));
  expect(
    await screen.findByRole('button', { name: /^Browse portfolio\s*Project not found$/ }),
  ).toBeTruthy();
});

it.each(['/unknown', '/?section=missing', '/projects/quiz/extra'])(
  'shows %s as not found without making a project request',
  async (url) => {
    window.history.replaceState(null, '', url);
    renderApp();
    await screen.findByRole('heading', { name: 'Page not found' });
    expect(document.title).toBe('Page not found · Vaidotas Petraitis');
    expect(
      vi.mocked(fetch).mock.calls.some(([url]) => String(url).startsWith('/api/v1/projects/')),
    ).toBe(false);
  },
);

it('keeps encoded project parameters within the project API path', async () => {
  window.history.replaceState(null, '', '/projects/quiz%2F..%2Fprofile');
  renderApp();
  await screen.findByRole('heading', { name: 'Project not found' });
  expect(vi.mocked(fetch).mock.calls.map(([url]) => url)).toContain(
    '/api/v1/projects/quiz%2F..%2Fprofile',
  );
});

it('shows loading and error feedback and retries the profile', async () => {
  const stub = vi.mocked(fetch);
  const normalFetch = stub.getMockImplementation()!;

  stub.mockImplementation(async (url) => {
    if (url === '/api/v1/profile') {
      return Response.json({ error: { message: 'Temporarily unavailable' } }, { status: 503 });
    }

    return normalFetch(url);
  });

  renderApp();
  const main = screen.getByRole('main');

  expect(within(main).getByRole('status')).toBeTruthy();
  await within(main).findByText('Temporarily unavailable');
  stub.mockImplementation(normalFetch);
  fireEvent.click(within(main).getByRole('button', { name: 'Try again' }));
  await screen.findByText(profile.role);
});

it('keeps mobile disclosure state and closes it after selection', async () => {
  renderApp();
  await screen.findByText(profile.role);
  const toggle = screen.getByRole('button', { name: /Browse portfolio/ });

  fireEvent.click(toggle);
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  fireEvent.click(screen.getByRole('link', { name: 'Experience' }));
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  await screen.findByRole('heading', { name: experience[0].role });
});

it('collapses and reopens the project tree', async () => {
  renderApp();
  await screen.findByRole('link', { name: 'Quiz' });
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
  expect(screen.queryByRole('link', { name: 'Quiz' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
  expect(screen.getByRole('link', { name: 'Quiz' })).toBeTruthy();
});

it('reopens a collapsed project category when navigating directly to its project', async () => {
  renderApp();
  await screen.findByRole('link', { name: 'Quiz' });
  fireEvent.click(screen.getByRole('link', { name: 'Quiz' }));
  await screen.findByRole('heading', { name: 'Quiz' });
  fireEvent.click(screen.getByRole('link', { name: /Vaidotas PetraitisSoftware engineer/ }));
  await screen.findByText(profile.role);
  const category = screen.getByRole('button', { name: 'Software Engineering' });

  fireEvent.click(category);
  expect(screen.queryByRole('link', { name: 'Quiz' })).toBeNull();

  await act(async () => {
    const navigated = new Promise((resolve) =>
      window.addEventListener('popstate', resolve, { once: true }),
    );

    window.history.back();
    await navigated;
  });

  await screen.findByRole('heading', { name: 'Quiz' });
  expect(category.getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByRole('link', { name: 'Quiz' }).getAttribute('aria-current')).toBe('page');
});

it.each(projects.map((project) => [project.slug, project.title]))(
  'renders the %s project',
  async (slug, title) => {
    window.history.replaceState(null, '', `/projects/${slug}`);
    renderApp();
    await screen.findByRole('heading', { name: 'Core capabilities' });
    expect(screen.getByRole('heading', { name: title })).toBeTruthy();
    await waitFor(() => expect(document.title).toBe(`${title} · Vaidotas Petraitis`));
  },
);

it.each([
  ['about', '/', 'About me'],
  ['experience', '/experience', 'Experience'],
  ['certifications', '/certifications', 'Certifications'],
])('redirects the old %s URL to its page', async (section, path, title) => {
  window.history.replaceState(null, '', `/?section=${section}`);
  renderApp();
  await screen.findByRole('heading', { name: title, level: 1 });
  expect(window.location.pathname).toBe(path);
  expect(window.location.search).toBe('');
  expect(
    screen
      .getByRole('link', { name: section === 'about' ? 'About' : title })
      .getAttribute('aria-current'),
  ).toBe('page');
});

it.each([
  ['/experience', '/api/v1/experience', experience[0].role],
  ['/certifications', '/api/v1/certifications', certifications[0].title],
  ['/projects/quiz', '/api/v1/projects/quiz', 'Core capabilities'],
])('retries failed content on %s', async (path, endpoint, heading) => {
  const normalFetch = vi.mocked(fetch).getMockImplementation()!;
  let failed = false;

  vi.mocked(fetch).mockImplementation(async (url) => {
    if (url === endpoint && !failed) {
      failed = true;

      return Response.json({ error: { message: 'Please retry' } }, { status: 503 });
    }

    return normalFetch(url);
  });

  window.history.replaceState(null, '', path);
  renderApp();
  const main = within(screen.getByRole('main'));

  await main.findByText('Please retry');
  fireEvent.click(main.getByRole('button', { name: 'Try again' }));
  await main.findByRole('heading', { name: heading });
});

it('aborts an obsolete project request and ignores its late response', async () => {
  const normalFetch = vi.mocked(fetch).getMockImplementation()!;
  const nextProject = projects.find((project) => project.slug !== 'quiz')!;
  const quiz = projects.find((project) => project.slug === 'quiz')!;
  let finishQuiz!: (response: Response) => void;
  let quizSignal!: AbortSignal;

  vi.mocked(fetch).mockImplementation((url, options) => {
    if (url === '/api/v1/projects/quiz') {
      quizSignal = options!.signal as AbortSignal;

      return new Promise<Response>((resolve) => {
        finishQuiz = resolve;
      });
    }

    return normalFetch(url);
  });

  window.history.replaceState(null, '', '/projects/quiz');
  renderApp();
  fireEvent.click(await screen.findByRole('link', { name: nextProject.title }));
  await screen.findByRole('heading', { name: 'Core capabilities' });
  expect(quizSignal.aborted).toBe(true);
  expect(document.title).toBe(`${nextProject.title} · Vaidotas Petraitis`);
  await act(async () => finishQuiz(Response.json(quiz)));
  expect(document.title).toBe(`${nextProject.title} · Vaidotas Petraitis`);
  expect(screen.getByRole('heading', { name: nextProject.title })).toBeTruthy();
});

it('cancels page and layout requests on unmount', async () => {
  const signals: AbortSignal[] = [];

  vi.mocked(fetch).mockImplementation((_url, options) => {
    const signal = options!.signal as AbortSignal;

    signals.push(signal);

    return new Promise<Response>((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    });
  });

  window.history.replaceState(null, '', '/experience');
  const view = renderApp();

  expect(signals).toHaveLength(4);
  await act(async () => view.unmount());
  expect(signals.every((signal) => signal.aborted)).toBe(true);
});

it('loads successfully when StrictMode restarts mount effects', async () => {
  render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );

  await screen.findByText(profile.role);
  expect(screen.queryByRole('alert')).toBeNull();
});
