import { useEffect, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { ApiRequestStatus } from '../../http/ApiRequestStatus';
import type { FetchData } from '../../http/useFetchData';
import { Icon } from '../../icons/Icons';
import type { ProjectCategory } from './schema';
import type { ProjectSummary } from '../projects/schema';
import { Link } from '../../app/navigation';
import { routeKey, type Route } from '../../app/navigation';

function Folder({
  label,
  open,
  toggle,
  children,
}: {
  label: string;
  open: boolean;
  toggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="folder">
      <button className="tree-row folder-button" aria-expanded={open} onClick={toggle}>
        <Icon name={open ? 'down' : 'right'} size={15} className="chevron" />
        <Icon name="folder" className="folder-icon" />
        <span>{label}</span>
      </button>
      {open && <div className="tree-branch">{children}</div>}
    </div>
  );
}
function NavigationTree({
  route,
  projects,
  projectGroups,
  onSelect,
}: {
  route: Route;
  projects: ProjectSummary[];
  projectGroups: ProjectCategory[];
  onSelect: () => void;
}) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    projects: true,
    'software-engineering': true,
    'applied-ai-engineering': true,
  });
  const activeRouteKey = routeKey(route);
  const selectedCategory = projects.find((project) => project.slug === activeRouteKey)?.category;
  useEffect(() => {
    if (selectedCategory)
      setExpandedFolders((current) => ({ ...current, projects: true, [selectedCategory]: true }));
  }, [activeRouteKey, selectedCategory]);
  const toggleFolder = (id: string) =>
    setExpandedFolders((current) => ({ ...current, [id]: !current[id] }));
  const renderNavigationItem = (id: string, label: string, icon: string, href: string) => (
    <Link
      className={`tree-row tree-link ${activeRouteKey === id ? 'selected' : ''}`}
      href={href}
      aria-current={activeRouteKey === id ? 'page' : undefined}
      onClick={onSelect}
    >
      <Icon name={icon} />
      <span>{label}</span>
    </Link>
  );
  return (
    <nav aria-label="Portfolio">
      <h2 className="explorer-title">Portfolio Explorer</h2>
      {renderNavigationItem('about', 'About', 'file', '/')}
      {renderNavigationItem('experience', 'Experience', 'calendar', '/?section=experience')}
      {projects.length > 0 && (
        <Folder
          label="Projects"
          open={expandedFolders.projects}
          toggle={() => toggleFolder('projects')}
        >
          {projectGroups.map((group) => {
            const categoryProjects = projects.filter((project) => project.category === group.id);
            return (
              categoryProjects.length > 0 && (
                <Folder
                  key={group.id}
                  label={group.label}
                  open={expandedFolders[group.id]}
                  toggle={() => toggleFolder(group.id)}
                >
                  {categoryProjects.map((project) => (
                    <div key={project.slug}>
                      {renderNavigationItem(
                        project.slug,
                        project.title,
                        'file',
                        `/projects/${project.slug}`,
                      )}
                    </div>
                  ))}
                </Folder>
              )
            );
          })}
        </Folder>
      )}
      {renderNavigationItem(
        'certifications',
        'Certifications',
        'award',
        '/?section=certifications',
      )}
    </nav>
  );
}

export function Explorer({
  route,
  projects,
  projectGroups,
  title,
  request,
}: {
  route: Route;
  projects: ProjectSummary[];
  projectGroups: ProjectCategory[];
  title: string;
  request: Pick<FetchData<unknown>, 'loading' | 'error' | 'retry'>;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
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
        <NavigationTree
          route={route}
          projects={projects}
          projectGroups={projectGroups}
          onSelect={() => setMobileOpen(false)}
        />
        <ApiRequestStatus {...request} label="project navigation" />
      </div>
    </aside>
  );
}
