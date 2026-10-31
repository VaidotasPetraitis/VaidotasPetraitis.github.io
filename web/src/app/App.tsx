import { useEffect, useRef, useState, type RefObject } from 'react';
import { useFetchData, type FetchData } from '../http/useFetchData';
import { ProfileHeader } from '../features/profile/ProfileHeader';
import { About } from '../features/profile/About';
import { profileSchema, type Profile } from '../features/profile/schema';
import { Experience } from '../features/experience/Experience';
import { Certifications } from '../features/certifications/Certifications';
import { ProjectPage } from '../features/projects/ProjectPage';
import { summariesSchema, type ProjectSummary } from '../features/projects/schema';
import { Explorer } from '../features/explorer/Explorer';
import {
  explorerSchema,
  type ProjectCategory,
  type Explorer as ExplorerData,
} from '../features/explorer/schema';
import { Link, routeKey, useRoute, type Route } from './navigation';

const sectionTitles = {
  about: 'About me',
  experience: 'Experience',
  certifications: 'Certifications',
  'not-found': 'Page not found',
};

type PageHeading = { routeKey: string; title: string };

function pageTitle(route: Route, projects: ProjectSummary[] | undefined) {
  if (route.kind !== 'project') return sectionTitles[route.kind];
  return projectTitle(route.slug, projects ?? []);
}

function projectTitle(slug: string, projects: ProjectSummary[]) {
  const project = projects.find((project) => project.slug === slug);
  return project?.title ?? 'Project';
}

function projectCategories(explorer: ExplorerData | undefined) {
  return explorer?.categories ?? [];
}

function currentTitle(key: string, heading: PageHeading, fallback: string) {
  if (heading.routeKey !== key) return fallback;
  return heading.title || fallback;
}

function focusPage(
  main: HTMLElement,
  heading: HTMLElement,
  key: string,
  previous: RefObject<string>,
) {
  if (previous.current === key) return;
  if (main.querySelector('[role="status"]')) return;
  heading.focus({ preventScroll: true });
  previous.current = key;
}

function keepPageHeading(current: PageHeading, next: PageHeading) {
  if (current.routeKey !== next.routeKey) return next;
  return current.title === next.title ? current : next;
}

function PageNotFound() {
  return (
    <article>
      <h1 tabIndex={-1}>Page not found</h1>
      <p className="page-summary">That page is not part of this portfolio.</p>
      <Link className="external-link" href="/">
        Return to About
      </Link>
    </article>
  );
}

function Page({
  route,
  profile,
  categories,
  title,
}: {
  route: Route;
  profile: FetchData<Profile>;
  categories: ProjectCategory[];
  title: string;
}) {
  if (route.kind === 'project')
    return <ProjectPage slug={route.slug} categories={categories} title={title} />;
  const pages = {
    about: <About request={profile} />,
    experience: <Experience />,
    certifications: <Certifications />,
    'not-found': <PageNotFound />,
  };
  return pages[route.kind];
}

export default function App() {
  const route = useRoute();
  const currentKey = routeKey(route);
  const profile = useFetchData('/api/v1/profile', profileSchema);
  const explorer = useFetchData('/api/v1/explorer', explorerSchema);
  const projects = useFetchData('/api/v1/projects', summariesSchema);
  const mainRef = useRef<HTMLElement>(null);
  const previousRoute = useRef(currentKey);
  const [pageHeading, setPageHeading] = useState({ routeKey: currentKey, title: '' });
  const fallbackTitle = pageTitle(route, projects.data);
  const title = currentTitle(currentKey, pageHeading, fallbackTitle);
  const navigationStatus = explorer.data ? projects : explorer;
  const categories = projectCategories(explorer.data);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const updatePageHeading = () => {
      const heading = main.querySelector<HTMLElement>('h1');
      if (!heading) return;
      const headingTitle = heading.textContent || fallbackTitle;
      document.title = `${headingTitle} \u00b7 Vaidotas Petraitis`;
      setPageHeading((current) =>
        keepPageHeading(current, { routeKey: currentKey, title: headingTitle }),
      );
      focusPage(main, heading, currentKey, previousRoute);
    };
    updatePageHeading();
    const observer = new MutationObserver(updatePageHeading);
    observer.observe(main, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [currentKey, fallbackTitle]);

  return (
    <div className="site">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <ProfileHeader profile={profile.data} />
      <div className="layout">
        <Explorer
          route={route}
          projects={projects.data ?? []}
          projectGroups={categories}
          title={title}
          request={navigationStatus}
        />
        <main id="main-content" ref={mainRef} className="main-content">
          <div key={currentKey} className="page-content">
            <Page route={route} profile={profile} categories={categories} title={fallbackTitle} />
          </div>
        </main>
      </div>
      <footer className="site-footer">
        Vaidotas Petraitis<span>Software engineering & applied AI</span>
      </footer>
    </div>
  );
}
