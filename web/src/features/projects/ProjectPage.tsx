import { ArrowUpRight } from 'lucide-react';
import type { Project } from './schema';
import type { ProjectCategory } from '../explorer/schema';
import { Icon } from '../../icons/Icons';
import { Diagram } from './Diagram';
import { Gallery } from './Gallery';
import type { UseQueryResult } from '@tanstack/react-query';
import type { APIError } from '../../http/api';
import { ApiRequestStatus } from '../../http/ApiRequestStatus';
import { Link } from 'react-router';

type ProjectPageProps = {
  request: UseQueryResult<Project, APIError>;
  categories: ProjectCategory[];
  title: string;
};

export function ProjectPage(props: ProjectPageProps) {
  const project = props.request.data;

  if (props.request.error?.status === 404) {
    return (
      <article>
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
        <h1>{props.title}</h1>
        <ApiRequestStatus {...props.request} label={props.title.toLowerCase()} />
      </>
    );
  }

  return <ProjectDetails project={project} categories={props.categories} />;
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
