import type { ReactNode } from 'react';
import type { Resource } from '../shared/useResource';
import { Status } from '../shared/Status';
import { About } from '../features/profile/About';
import { Experience } from '../features/experience/Experience';
import { Certifications } from '../features/certifications/Certifications';
import { ProjectPage } from '../features/projects/ProjectPage';
import { Link } from './navigation';
import type { Route } from './routes';
import type { PortfolioResources } from './resources';

function LoadingState({ resource, title }: { resource: Resource<unknown>; title: string }) {
  const visible = resource.loading || Boolean(resource.error);
  if (!visible) return null;
  return (
    <>
      <h1 tabIndex={-1}>{title}</h1>
      <Status {...resource} label={title.toLowerCase()} />
    </>
  );
}

export function ResourcePage<T>({
  resource,
  title,
  children,
}: {
  resource: Resource<T>;
  title: string;
  children: (data: T) => ReactNode;
}) {
  return (
    <>
      <LoadingState resource={resource} title={title} />
      {resource.data && children(resource.data)}
    </>
  );
}

export function NotFound({ title }: { title: string }) {
  return (
    <article>
      <h1 tabIndex={-1}>{title}</h1>
      <p className="page-summary">That page is not part of this portfolio.</p>
      <Link className="external-link" href="/">
        Return to About
      </Link>
    </article>
  );
}

function ProjectRoute({ resources, title }: { resources: PortfolioResources; title: string }) {
  if (resources.project.error?.status === 404) return <NotFound title="Project not found" />;
  return (
    <ResourcePage resource={resources.project} title={title}>
      {(project) => (
        <ProjectPage project={project} categories={resources.explorer.data?.categories ?? []} />
      )}
    </ResourcePage>
  );
}

export function PageContent({
  route,
  resources,
  title,
}: {
  route: Route;
  resources: PortfolioResources;
  title: string;
}) {
  const sections = {
    about: (
      <ResourcePage resource={resources.profile} title={title}>
        {(profile) => <About profile={profile} />}
      </ResourcePage>
    ),
    experience: (
      <ResourcePage resource={resources.experience} title={title}>
        {(entries) => <Experience entries={entries} />}
      </ResourcePage>
    ),
    certifications: (
      <ResourcePage resource={resources.certifications} title={title}>
        {(entries) => <Certifications entries={entries} />}
      </ResourcePage>
    ),
    'not-found': <NotFound title="Page not found" />,
  };
  if (route.kind === 'project') return <ProjectRoute resources={resources} title={title} />;
  return sections[route.kind];
}
