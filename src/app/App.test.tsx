import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { HashRouter } from 'react-router';
import App from './App';
import profile from '../data/profile.json';
import experience from '../data/experience.json';
import certifications from '../data/certifications.json';
import projects from '../data/projects.json';

function renderApp() {
  return render(
    <HashRouter>
      <App />
    </HashRouter>,
  );
}

beforeEach(() => {
  window.history.replaceState(null, '', '/#/');
  window.scrollTo = vi.fn();

  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };

  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});

afterEach(() => {
  cleanup();
});

it('renders About from bundled content', async () => {
  renderApp();
  await screen.findByText(profile.role);
  expect(document.title).toBe('About me · Vaidotas Petraitis');
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
  await screen.findByRole('heading', { name: experience[0].role });
  expect(screen.getByRole('banner')).toBe(header);
  expect(document.activeElement).toBe(main);
  expect(window.location.hash).toBe('#/experience');
  expect(screen.getByRole('link', { name: 'Experience' }).getAttribute('aria-current')).toBe(
    'page',
  );

  expect(document.title).toBe('Experience · Vaidotas Petraitis');
  const skipLink = screen.getByRole('link', { name: 'Skip to content' });

  skipLink.focus();
  fireEvent.click(skipLink);
  expect(document.activeElement).toBe(main);
  expect(window.location.hash).toBe('#/experience');

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
  window.history.replaceState(null, '', '/#/certifications');
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
  expect(within(dialog).getByText('1 / 4')).toBeTruthy();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Close screenshot' }));
  expect(dialog.hasAttribute('open')).toBe(false);
  fireEvent.click(buttons[1]);
  fireEvent.click(dialog);
  expect(dialog.hasAttribute('open')).toBe(false);
});

it('shows project 404s and a link back to About', async () => {
  window.history.replaceState(null, '', '/#/projects/missing');
  renderApp();
  await screen.findByRole('heading', { name: 'Project not found' });
  await waitFor(() => expect(document.title).toBe('Project not found · Vaidotas Petraitis'));
  fireEvent.click(screen.getByRole('link', { name: 'Return to About' }));
  await screen.findByText(profile.role);
});

it.each(['/unknown', '/projects/quiz/extra'])('shows %s as not found', async (url) => {
  window.history.replaceState(null, '', `/#${url}`);
  renderApp();
  await screen.findByRole('heading', { name: 'Page not found' });
  expect(document.title).toBe('Page not found · Vaidotas Petraitis');
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

it('links to the live Rutuliukai game and its source repository', async () => {
  window.history.replaceState(null, '', '/#/projects/rutuliukai');
  renderApp();

  const play = await screen.findByRole('link', { name: /Play Rutuliukai/ });

  expect(play.getAttribute('href')).toBe('https://vaidotaspetraitis.github.io/rutuliukai/');
  expect(play.getAttribute('target')).toBe('_blank');
  expect(screen.getByRole('link', { name: /View source/ }).getAttribute('href')).toBe(
    'https://github.com/VaidotasPetraitis/rutuliukai',
  );
});

it.each(projects.map((project) => [project.slug, project.title]))(
  'renders the %s project',
  async (slug, title) => {
    window.history.replaceState(null, '', `/#/projects/${slug}`);
    renderApp();
    await screen.findByRole('heading', { name: 'Core capabilities' });
    expect(screen.getByRole('heading', { name: title })).toBeTruthy();
    await waitFor(() => expect(document.title).toBe(`${title} · Vaidotas Petraitis`));
  },
);
