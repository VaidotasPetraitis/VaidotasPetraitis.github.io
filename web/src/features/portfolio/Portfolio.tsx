import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigationType, useParams } from 'react-router';
import { useRequest } from '../../http/useRequest';
import { PortfolioHeader } from './PortfolioHeader';
import { About } from '../about/About';
import { getProfile } from '../about/service';
import { Experience } from '../experience/Experience';
import { Certifications } from '../certifications/Certifications';
import { ProjectPage } from '../projects/ProjectPage';
import { Explorer } from '../explorer/Explorer';
import { getNavigation } from '../explorer/service';

type Page = 'about' | 'experience' | 'certifications' | 'project' | 'not-found';

const sectionTitles = {
  about: 'About me',
  experience: 'Experience',
  certifications: 'Certifications',
  'not-found': 'Page not found',
};

type PortfolioProps = {
  page: Page;
};

type ProjectTitle = { slug?: string; title: string };

function pageTitle(page: Page, slug: string | undefined, project: ProjectTitle) {
  if (page !== 'project') {
    return sectionTitles[page];
  }

  return project.slug === slug ? project.title : 'Project';
}

export function Portfolio(props: PortfolioProps) {
  const location = useLocation();
  const params = useParams();
  const navigationType = useNavigationType();
  const page = props.page;
  const currentKey = location.pathname + location.search;
  const profile = useRequest(getProfile);
  const navigation = useRequest(getNavigation);
  const categories = navigation.data?.categories ?? [];
  const [projectTitle, setProjectTitle] = useState<ProjectTitle>({
    title: 'Project',
  });

  const title = pageTitle(page, params.slug, projectTitle);
  const mainRef = useRef<HTMLElement>(null);
  const previousPage = useRef(currentKey);

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
      <ProjectPage slug={params.slug!} categories={categories} onTitleChange={setProjectTitle} />
    ),
    'not-found': <PageNotFound />,
  };

  return (
    <div className="site">
      {page !== 'project' && <title>{`${title} · Vaidotas Petraitis`}</title>}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <PortfolioHeader profile={profile.data} />
      <div className="layout">
        <Explorer title={title} request={navigation} />
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
