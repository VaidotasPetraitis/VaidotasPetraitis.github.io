import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigationType, useParams } from 'react-router';
import { PortfolioHeader } from './PortfolioHeader';
import { About } from '../about/About';
import { profileSchema } from '../about/schema';
import profileData from '../../data/profile.json';
import { Experience } from '../experience/Experience';
import { Certifications } from '../certifications/Certifications';
import { ProjectPage } from '../projects/ProjectPage';
import { Explorer } from '../explorer/Explorer';
import { categories } from '../../data/categories';
import { projectSchema } from '../projects/schema';
import projectData from '../../data/projects.json';

const profile = profileSchema.parse(profileData);
const projects = projectSchema.array().parse(projectData);

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

export function Portfolio(props: PortfolioProps) {
  const location = useLocation();
  const params = useParams();
  const navigationType = useNavigationType();
  const page = props.page;
  const currentKey = location.pathname + location.search;
  const project = projects.find(({ slug }) => slug === params.slug);
  const title = page === 'project' ? (project?.title ?? 'Project not found') : sectionTitles[page];
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
    about: <About profile={profile} />,
    experience: <Experience />,
    certifications: <Certifications />,
    project: <ProjectPage project={project} categories={categories} />,
    'not-found': <PageNotFound />,
  };

  return (
    <div className="site">
      <title>{`${title} · Vaidotas Petraitis`}</title>
      <a
        href="#main-content"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>
      <PortfolioHeader profile={profile} />
      <div className="layout">
        <Explorer title={title} projects={projects} categories={categories} />
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
