import { ArrowUpRight } from 'lucide-react';
import type { Project } from './schema';
import type { ProjectCategory } from '../explorer/schema';
import { Icon } from '../../icons/Icons';
import { Diagram } from './Diagram';
import { Gallery } from './Gallery';
import { ApiRequestStatus } from '../../http/ApiRequestStatus';
import { useRequest } from '../../http/useRequest';
import { useCallback, useEffect } from 'react';
import { getProject } from './service';
import { Link } from 'react-router';

type ProjectPageProps = {
  slug: string;
  categories: ProjectCategory[];
  onTitleChange: (project: { slug: string; title: string }) => void;
};

export function ProjectPage(props: ProjectPageProps) {
  const { slug, onTitleChange } = props;
  const loadProject = useCallback((signal: AbortSignal) => getProject(slug, signal), [slug]);
  const request = useRequest(loadProject);
  const project = request.data;
  const notFound = request.error?.status === 404;

  useEffect(() => {
    if (request.loading) {
      return;
    }

    let title = 'Project';

    if (project) {
      title = project.title;
    } else if (notFound) {
      title = 'Project not found';
    }

    onTitleChange({ slug, title });
  }, [request.loading, project, notFound, slug, onTitleChange]);

  if (notFound) {
    return (
      <article>
        <title>Project not found · Vaidotas Petraitis</title>
        <h1>Project not found</h1>
        <p className="page-summary">That page is not part of this portfolio.</p>
        <Link className="external-link" to="/">
          Return to About
        </Link>
      </article>
    );
  }

  if (!project) {
    return (
      <>
        <title>Project · Vaidotas Petraitis</title>
        <h1>Project</h1>
        <ApiRequestStatus {...request} label="project" />
      </>
    );
  }

  return (
    <>
      <title>{`${project.title} · Vaidotas Petraitis`}</title>
      <ProjectDetails project={project} categories={props.categories} />
    </>
  );
}

type ProjectDetailsProps = {
  project: Project;
  categories: ProjectCategory[];
};

function ProjectDetails(props: ProjectDetailsProps) {
  const categoryLabel =
    props.categories.find((category) => category.id === props.project.category)?.label ??
    props.project.category;

  return (
    <article className="project-page">
      <h1>{props.project.title}</h1>
      <p className="page-summary">{props.project.summary}</p>
      <p className="sr-only">Category: {categoryLabel}</p>
      <ul className="technologies" aria-label="Technologies">
        {props.project.technologies.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <a
        className="source-link"
        href={props.project.source}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon name="github" size={26} />
        <span>
          <span className="source-label">
            View source <ArrowUpRight size={15} aria-hidden="true" />
          </span>
          <span className="repository">{props.project.repository}</span>
        </span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      <Diagram diagram={props.project.diagram} />
      <section className="capabilities">
        <h2>Core capabilities</h2>
        <ul>
          {props.project.capabilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="code-organisation">
        <h2>Code organisation</h2>
        <p>{props.project.organization}</p>
      </section>
      {props.project.sections.map((section) => (
        <ProjectSection key={section.title} section={section} />
      ))}
      <p className="project-note">{props.project.note}</p>
      <Gallery
        key={props.project.slug}
        screenshots={props.project.screenshots}
        columns={props.project.screenshots.length > 4 ? 3 : 2}
      />
    </article>
  );
}

type ProjectSectionProps = {
  section: Project['sections'][number];
};

function ProjectSection(props: ProjectSectionProps) {
  return (
    <section className="project-section">
      <h2>{props.section.title}</h2>
      {props.section.paragraphs.map((text) => (
        <p key={text}>{text}</p>
      ))}
      {props.section.items.length > 0 && (
        <ul>
          {props.section.items.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
