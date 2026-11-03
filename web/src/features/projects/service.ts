import { getJson } from '../../http/getJson';
import { projectSchema, summariesSchema } from './schema';

export function getProjects(signal?: AbortSignal) {
  return getJson('/api/v1/projects', summariesSchema, signal);
}

export function getProject(slug: string, signal?: AbortSignal) {
  return getJson(`/api/v1/projects/${encodeURIComponent(slug)}`, projectSchema, signal);
}
