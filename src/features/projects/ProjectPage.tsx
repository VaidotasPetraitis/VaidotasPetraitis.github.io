import { ArrowUpRight, Play } from 'lucide-react';
import type { Project } from './schema';
import type { ProjectCategory } from '../../data/categories';
import { Icon } from '../../icons/Icons';
import { Diagram } from './Diagram';
import { Gallery } from './Gallery';
import { Link } from 'react-router';

export function ProjectPage({
  project,
  categories,
}: {
  project: Project | undefined;
  categories: ProjectCategory[];
}) {
  if (!project) {
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

  return <ProjectDetails project={project} categories={categories} />;
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
      <div className="project-actions">
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
            <span className="repository">{new URL(props.project.source).pathname.slice(1)}</span>
          </span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        {props.project.playUrl && (
          <a
            className="play-link"
            href={props.project.playUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Play size={16} aria-hidden="true" />
            Play {props.project.title}
            <ArrowUpRight size={15} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
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
      <Gallery key={props.project.slug} screenshots={props.project.screenshots} />
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
    </section>
  );
}
