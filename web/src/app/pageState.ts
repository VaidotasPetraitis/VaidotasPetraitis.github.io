import type { Route } from './routes';
import type { PortfolioResources } from './resources';

const sectionTitles = {
  about: 'About me',
  experience: 'Experience',
  certifications: 'Certifications',
  'not-found': 'Page not found',
};

function navigationTitle(resources: PortfolioResources, slug: string) {
  return resources.projects.data?.find((summary) => summary.slug === slug)?.title ?? 'Project';
}

export function pageTitle(route: Route, resources: PortfolioResources) {
  if (route.kind === 'project')
    return resources.project.data?.title ?? navigationTitle(resources, route.slug);
  return sectionTitles[route.kind];
}

export function pageResource(route: Route, resources: PortfolioResources) {
  const lookup = {
    about: resources.profile,
    experience: resources.experience,
    certifications: resources.certifications,
    project: resources.project,
    'not-found': { loading: false },
  };
  return lookup[route.kind];
}
