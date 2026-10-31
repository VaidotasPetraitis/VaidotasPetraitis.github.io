import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from 'react';

export type Route =
  | { kind: 'about' | 'experience' | 'certifications' | 'not-found' }
  | { kind: 'project'; slug: string };
const sections = new Map<string, Route>([
  ['about', { kind: 'about' }],
  ['experience', { kind: 'experience' }],
  ['certifications', { kind: 'certifications' }],
]);

function sectionRoute(search: string): Route {
  const section = new URLSearchParams(search).get('section') ?? 'about';
  return sections.get(section) ?? { kind: 'not-found' };
}

function projectRoute(pathname: string): Route {
  const match = /^\/projects\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(pathname);
  return match ? { kind: 'project', slug: match[1] } : { kind: 'not-found' };
}

export function parseRoute(location: { pathname: string; search: string }): Route {
  return location.pathname === '/'
    ? sectionRoute(location.search)
    : projectRoute(location.pathname);
}
export function routeKey(route: Route) {
  return route.kind === 'project' ? route.slug : route.kind;
}

export function readRoute() {
  return parseRoute(window.location);
}
export function useRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const update = () => setRoute(readRoute());
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  return route;
}

function hasModifier(event: MouseEvent<HTMLAnchorElement>) {
  return [event.ctrlKey, event.metaKey, event.shiftKey, event.altKey].some(Boolean);
}
function shouldNavigate(event: MouseEvent<HTMLAnchorElement>) {
  return !event.defaultPrevented && event.button === 0 && !hasModifier(event);
}
function navigate(href: string) {
  if (window.location.pathname + window.location.search === href) return;
  window.history.pushState(null, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'instant' });
}
export function Link({
  href,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (!shouldNavigate(event)) return;
    event.preventDefault();
    navigate(href);
  }
  return <a {...props} href={href} onClick={handleClick} />;
}
