import { getJson } from '../../http/getJson';
import { experienceSchema } from './schema';

export function getExperience(signal?: AbortSignal) {
  return getJson('/api/v1/experience', experienceSchema, signal);
}
