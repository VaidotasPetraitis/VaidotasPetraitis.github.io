import { ArrowUpRight } from 'lucide-react';
import { projectSchema, type Project } from './schema';
import type { ProjectCategory } from '../explorer/schema';
import { Icon } from '../../icons/Icons';
import { Diagram } from './Diagram';
import { Gallery } from './Gallery';
import { useFetchData } from '../../http/useFetchData';
import { ApiRequestStatus } from '../../http/ApiRequestStatus';
import { Link } from '../../app/navigation';

export function ProjectPage({
  slug,
  categories,
  title,
}: {
  slug: string;
  categories: ProjectCategory[];
  title: string;
}) {
  const request = useFetchData(`/api/v1/projects/${slug}`, projectSchema);
  const project = request.data;
  if (request.error?.status === 404)
    return (
      <article>
        <h1 tabIndex={-1}>Project not found</h1>
        <p className="page-summary">That page is not part of this portfolio.</p>
        <Link className="external-link" href="/">
          Return to About
        </Link>
      </article>
    );
  if (!project)
    return (
      <>
        <h1 tabIndex={-1}>{title}</h1>
        <ApiRequestStatus {...request} label={title.toLowerCase()} />
      </>
    );

  return <ProjectDetails project={project} categories={categories} />;
}

function ProjectDetails({
  project,
  categories,
}: {
  project: Project;
  categories: ProjectCategory[];
}) {
  const categoryLabel =
    categories.find((category) => category.id === project.category)?.label ?? project.category;
  return (
    <article className="project-page">
      <h1 tabIndex={-1}>{project.title}</h1>
      <p className="page-summary">{project.summary}</p>
      <p className="sr-only">Category: {categoryLabel}</p>
      <ul className="technologies" aria-label="Technologies">
        {project.technologies.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <a className="source-link" href={project.source} target="_blank" rel="noopener noreferrer">
        <Icon name="github" size={26} />
        <span>
          <span className="source-label">
            View source <ArrowUpRight size={15} aria-hidden="true" />
          </span>
          <span className="repository">{project.repository}</span>
        </span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      <Diagram diagram={project.diagram} />
      <section className="capabilities">
        <h2>Core capabilities</h2>
        <ul>
          {project.capabilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="code-organisation">
        <h2>Code organisation</h2>
        <p>{project.organization}</p>
      </section>
      {project.sections.map((section) => (
        <section className="project-section" key={section.title}>
          <h2>{section.title}</h2>
          {section.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
          {section.items.length > 0 && (
            <ul>
              {section.items.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <p className="project-note">{project.note}</p>
      <Gallery
        key={project.slug}
        screenshots={project.screenshots}
        columns={project.screenshots.length > 4 ? 3 : 2}
      />
    </article>
  );
}
