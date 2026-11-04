import { useEffect, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { NavLink, useLocation, useParams } from 'react-router';
import { Icon } from '../../icons/Icons';
import type { ProjectCategory } from '../../data/categories';
import type { ProjectSummary } from '../projects/schema';

type ExplorerProps = {
  title: string;
  projects: ProjectSummary[];
  categories: ProjectCategory[];
};

export function Explorer({ title, projects, categories }: ExplorerProps) {
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
          projects={projects}
          projectGroups={categories}
          onSelect={() => setMobileOpen(false)}
        />
      </div>
    </aside>
  );
}

type FolderProps = {
  label: string;
  open: boolean;
  toggle: () => void;
  children: ReactNode;
};

function Folder(props: FolderProps) {
  return (
    <div className="folder">
      <button className="tree-row folder-button" aria-expanded={props.open} onClick={props.toggle}>
        <Icon name={props.open ? 'down' : 'right'} size={15} className="chevron" />
        <Icon name="folder" className="folder-icon" />
        <span>{props.label}</span>
      </button>
      {props.open && <div className="tree-branch">{props.children}</div>}
    </div>
  );
}

type NavigationTreeProps = {
  projects: ProjectSummary[];
  projectGroups: ProjectCategory[];
  onSelect: () => void;
};

function NavigationTree(props: NavigationTreeProps) {
  const params = useParams();
  const location = useLocation();
  const [expandedFolders, setExpandedFolders] = useState<Partial<Record<string, boolean>>>({
    projects: true,
    'software-engineering': true,
    'applied-ai-engineering': true,
  });
  const activeRouteKey = params.slug ?? location.pathname;
  const selectedCategory = props.projects.find(
    (project) => project.slug === activeRouteKey,
  )?.category;

  useEffect(() => {
    if (selectedCategory) {
      setExpandedFolders((current) => ({ ...current, projects: true, [selectedCategory]: true }));
    }
  }, [activeRouteKey, selectedCategory]);

  const toggleFolder = (id: string) =>
    setExpandedFolders((current) => ({ ...current, [id]: !current[id] }));

  return (
    <nav aria-label="Portfolio">
      <h2 className="explorer-title">Portfolio Explorer</h2>
      <NavigationLink label="About" icon="file" to="/" onSelect={props.onSelect} />
      <NavigationLink
        label="Experience"
        icon="calendar"
        to="/experience"
        onSelect={props.onSelect}
      />
      {props.projects.length > 0 && (
        <Folder
          label="Projects"
          open={Boolean(expandedFolders.projects)}
          toggle={() => toggleFolder('projects')}
        >
          {props.projectGroups.map((group) => (
            <ProjectGroup
              key={group.id}
              label={group.label}
              projects={props.projects.filter((project) => project.category === group.id)}
              open={Boolean(expandedFolders[group.id])}
              toggle={() => toggleFolder(group.id)}
              onSelect={props.onSelect}
            />
          ))}
        </Folder>
      )}
      <NavigationLink
        label="Certifications"
        icon="award"
        to="/certifications"
        onSelect={props.onSelect}
      />
    </nav>
  );
}

type NavigationLinkProps = {
  label: string;
  icon: string;
  to: string;
  onSelect: () => void;
};

function NavigationLink(props: NavigationLinkProps) {
  return (
    <NavLink
      className={({ isActive }) => `tree-row tree-link ${isActive ? 'selected' : ''}`}
      to={props.to}
      end
      caseSensitive
      onClick={props.onSelect}
    >
      <Icon name={props.icon} />
      <span>{props.label}</span>
    </NavLink>
  );
}

type ProjectGroupProps = {
  label: string;
  projects: ProjectSummary[];
  open: boolean;
  toggle: () => void;
  onSelect: () => void;
};

function ProjectGroup(props: ProjectGroupProps) {
  if (props.projects.length === 0) {
    return null;
  }

  return (
    <Folder label={props.label} open={props.open} toggle={props.toggle}>
      {props.projects.map((project) => (
        <NavigationLink
          key={project.slug}
          label={project.title}
          icon="file"
          to={`/projects/${encodeURIComponent(project.slug)}`}
          onSelect={props.onSelect}
        />
      ))}
    </Folder>
  );
}
