import { getJson } from '../../http/getJson';
import { certificationsSchema } from './schema';

export function getCertifications(signal?: AbortSignal) {
  return getJson('/api/v1/certifications', certificationsSchema, signal);
}
