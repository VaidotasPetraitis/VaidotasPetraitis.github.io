import { useResource } from '../shared/useResource';
import {
  profileSchema,
  experienceSchema,
  summariesSchema,
  certificationsSchema,
  projectSchema,
  explorerSchema,
} from '../shared/models';
import type { Route } from './routes';

export function usePortfolioResources(route: Route) {
  const explorer = useResource('/api/v1/explorer', explorerSchema);
  const profile = useResource('/api/v1/profile', profileSchema);
  const experience = useResource('/api/v1/experience', experienceSchema);
  const projects = useResource('/api/v1/projects', summariesSchema);
  const certifications = useResource('/api/v1/certifications', certificationsSchema);
  const project = useResource(
    route.kind === 'project' ? `/api/v1/projects/${route.slug}` : null,
    projectSchema,
  );
  return { profile, experience, projects, certifications, project, explorer };
}
export type PortfolioResources = ReturnType<typeof usePortfolioResources>;
