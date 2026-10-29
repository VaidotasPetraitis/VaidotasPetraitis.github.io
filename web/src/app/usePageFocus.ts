import { useEffect, useRef, type RefObject } from 'react';

export function usePageFocus(
  title: string,
  routeKey: string,
  loading: boolean,
  mainRef: RefObject<HTMLElement | null>,
) {
  const previousRoute = useRef(routeKey);
  useEffect(() => {
    document.title = `${title} · Vaidotas Petraitis`;
  }, [title]);
  useEffect(() => {
    if (previousRoute.current !== routeKey && !loading) {
      mainRef.current?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
      previousRoute.current = routeKey;
    }
  }, [routeKey, loading, mainRef]);
}
