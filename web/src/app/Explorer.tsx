import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '../shared/Icons';
import type { ProjectCategory, ProjectSummary } from '../shared/models';
import { Link } from './navigation';
import { routeKey, type Route } from './routes';

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
export function Explorer({
  route,
  projects,
  projectGroups,
  onSelect,
  hasExperience = true,
  hasCertifications = true,
}: {
  route: Route;
  projects: ProjectSummary[];
  projectGroups: ProjectCategory[];
  onSelect: () => void;
  hasExperience?: boolean;
  hasCertifications?: boolean;
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
      {hasExperience &&
        renderNavigationItem('experience', 'Experience', 'calendar', '/?section=experience')}
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
      {hasCertifications &&
        renderNavigationItem(
          'certifications',
          'Certifications',
          'award',
          '/?section=certifications',
        )}
    </nav>
  );
}
