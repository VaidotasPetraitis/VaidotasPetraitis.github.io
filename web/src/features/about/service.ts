import { getJson } from '../../http/getJson';
import { profileSchema } from './schema';

export function getProfile(signal?: AbortSignal) {
  return getJson('/api/v1/profile', profileSchema, signal);
}
