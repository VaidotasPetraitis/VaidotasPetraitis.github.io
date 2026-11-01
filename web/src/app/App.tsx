import { useEffect, useRef } from 'react';
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigationType,
  useParams,
  useSearchParams,
} from 'react-router';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiQuery, type APIError } from '../http/api';
import { ProfileHeader } from '../features/profile/ProfileHeader';
import { About } from '../features/profile/About';
import { profileSchema } from '../features/profile/schema';
import { Experience } from '../features/experience/Experience';
import { Certifications } from '../features/certifications/Certifications';
import { ProjectPage } from '../features/projects/ProjectPage';
import {
  projectSchema,
  summariesSchema,
  type Project,
  type ProjectSummary,
} from '../features/projects/schema';
import { Explorer } from '../features/explorer/Explorer';
import { explorerSchema } from '../features/explorer/schema';

type Section = 'about' | 'experience' | 'certifications';
type Page = Section | 'project' | 'not-found';

const legacyPaths = new Map([
  ['about', '/'],
  ['experience', '/experience'],
  ['certifications', '/certifications'],
]);

const sectionTitles = {
  about: 'About me',
  experience: 'Experience',
  certifications: 'Certifications',
  'not-found': 'Page not found',
};

export default function App() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  if (location.pathname === '/' && searchParams.has('section')) {
    return <Navigate to={legacyPaths.get(searchParams.get('section')!) ?? '/not-found'} replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Portfolio page="about" />} />
      <Route path="/experience" caseSensitive element={<Portfolio page="experience" />} />
      <Route path="/certifications" caseSensitive element={<Portfolio page="certifications" />} />
      <Route path="/projects/:slug" caseSensitive element={<Portfolio page="project" />} />
      <Route path="*" element={<Portfolio page="not-found" />} />
    </Routes>
  );
}

type PortfolioProps = {
  page: Page;
};

function Portfolio(props: PortfolioProps) {
  const location = useLocation();
  const params = useParams();
  const navigationType = useNavigationType();
  const page = props.page;
  const currentKey = location.pathname + location.search;
  const profile = useQuery(apiQuery('/api/v1/profile', profileSchema));
  const explorer = useQuery(apiQuery('/api/v1/explorer', explorerSchema));
  const projects = useQuery(apiQuery('/api/v1/projects', summariesSchema));
  const project = useQuery({
    ...apiQuery(`/api/v1/projects/${encodeURIComponent(String(params.slug))}`, projectSchema),
    enabled: page === 'project',
  });
  const title = getPageTitle(page, params.slug, projects.data, project);
  const mainRef = useRef<HTMLElement>(null);
  const previousPage = useRef(currentKey);
  const navigationStatus = explorer.data ? projects : explorer;
  const explorerContent = explorer.data ?? { categories: [] };

  useEffect(() => {
    if (previousPage.current === currentKey) {
      return;
    }

    mainRef.current?.focus({ preventScroll: true });
    previousPage.current = currentKey;

    if (navigationType !== 'POP') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentKey, navigationType]);

  const pages = {
    about: <About request={profile} />,
    experience: <Experience />,
    certifications: <Certifications />,
    project: (
      <ProjectPage request={project} categories={explorerContent.categories} title={title} />
    ),
    'not-found': <PageNotFound />,
  };

  return (
    <div className="site">
      <title>{`${title} · Vaidotas Petraitis`}</title>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <ProfileHeader profile={profile.data} />
      <div className="layout">
        <Explorer
          projects={projects.data ?? []}
          projectGroups={explorerContent.categories}
          title={title}
          request={navigationStatus}
        />
        <main id="main-content" ref={mainRef} className="main-content" tabIndex={-1}>
          <div key={currentKey} className="page-content">
            {pages[page]}
          </div>
        </main>
      </div>
      <footer className="site-footer">
        Vaidotas Petraitis<span>Software engineering & applied AI</span>
      </footer>
    </div>
  );
}

function PageNotFound() {
  return (
    <article>
      <h1>Page not found</h1>
      <p className="page-summary">That page is not part of this portfolio.</p>
      <Link className="external-link" to="/">
        Return to About
      </Link>
    </article>
  );
}

function getPageTitle(
  page: Page,
  slug: string | undefined,
  projects: ProjectSummary[] | undefined,
  project: UseQueryResult<Project, APIError>,
) {
  if (page !== 'project') {
    return sectionTitles[page];
  }

  const summary = projects?.find((project) => project.slug === slug);

  return getProjectTitle(project, summary ? summary.title : 'Project');
}

function getProjectTitle(request: UseQueryResult<Project, APIError>, fallback: string) {
  if (request.error?.status === 404) {
    return 'Project not found';
  }

  if (request.data) {
    return request.data.title;
  }

  return fallback;
}
