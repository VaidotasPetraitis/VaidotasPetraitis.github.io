import type { ProjectCategory } from './models';

export function categoryLabel(categories: ProjectCategory[], id: string) {
  return categories.find((group) => group.id === id)?.label ?? id;
}
