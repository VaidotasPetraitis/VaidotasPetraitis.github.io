import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from 'react';

import { parseRoute } from './routes';
export { routeKey, type Route } from './routes';

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
