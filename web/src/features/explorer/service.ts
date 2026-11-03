import { getJson } from '../../http/getJson';
import type { Result } from '../../http/result';
import { getProjects } from '../projects/service';
import type { ProjectSummary } from '../projects/schema';
import { explorerSchema, type ProjectCategory } from './schema';

export type NavigationData = {
  projects: ProjectSummary[];
  categories: ProjectCategory[];
};

export function getExplorer(signal?: AbortSignal) {
  return getJson('/api/v1/explorer', explorerSchema, signal);
}

export async function getNavigation(signal?: AbortSignal): Promise<Result<NavigationData>> {
  const [explorer, projects] = await Promise.all([getExplorer(signal), getProjects(signal)]);

  if (!explorer.ok) {
    return explorer;
  }

  if (!projects.ok) {
    return projects;
  }

  return { ok: true, data: { categories: explorer.data.categories, projects: projects.data } };
}
