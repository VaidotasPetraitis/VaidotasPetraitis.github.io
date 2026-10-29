import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Status } from '../shared/Status';
import { SiteHeader } from './SiteHeader';
import { Explorer } from './Explorer';
import { routeKey, useRoute } from './navigation';
import { PageContent } from './PageContent';
import { usePortfolioResources } from './resources';
import { pageTitle, pageResource } from './pageState';
import { usePageFocus } from './usePageFocus';

export default function App() {
  const route = useRoute();
  const currentKey = routeKey(route);
  const resources = usePortfolioResources(route);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const title = pageTitle(route, resources);
  const navigationStatus = resources.explorer.data ? resources.projects : resources.explorer;
  usePageFocus(title, currentKey, pageResource(route, resources).loading, mainRef);
  return (
    <div className="site">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SiteHeader profile={resources.profile.data} />
      <div className="layout">
        <aside className="explorer">
          <button
            className="mobile-navigation-toggle"
            aria-expanded={mobileOpen}
            aria-controls="portfolio-navigation"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span>
              <span>Browse portfolio</span>
              <span className="mobile-current">{title}</span>
            </span>
            <ChevronDown size={18} className={mobileOpen ? 'rotated' : ''} />
          </button>
          <div
            id="portfolio-navigation"
            className={`explorer-content ${mobileOpen ? 'mobile-open' : ''}`}
          >
            <Explorer
              route={route}
              projects={resources.projects.data ?? []}
              projectGroups={resources.explorer.data?.categories ?? []}
              hasExperience={resources.experience.data?.length !== 0}
              hasCertifications={resources.certifications.data?.length !== 0}
              onSelect={() => setMobileOpen(false)}
            />
            <Status {...navigationStatus} label="project navigation" />
          </div>
        </aside>
        <main id="main-content" ref={mainRef} className="main-content">
          <div key={currentKey} className="page-content">
            <PageContent route={route} resources={resources} title={title} />
          </div>
        </main>
      </div>
      <footer className="site-footer">
        Vaidotas Petraitis<span>Software engineering & applied AI</span>
      </footer>
    </div>
  );
}
