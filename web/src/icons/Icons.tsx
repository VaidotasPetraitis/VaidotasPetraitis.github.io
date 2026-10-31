import {
  Award,
  BrainCircuit,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Database,
  FileText,
  Folder,
  GitBranch,
  List,
  Mail,
  MessageSquare,
  Network,
  Play,
  Settings,
  Wrench,
  PanelsTopLeft,
} from 'lucide-react';

const brandPaths: Record<string, string> = {
  github:
    'M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.08c-3.12.68-3.78-1.32-3.78-1.32-.5-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.93.1-.72.4-1.22.71-1.5-2.49-.29-5.1-1.25-5.1-5.54 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.08 1.15A10.6 10.6 0 0 1 12 6.22c.95 0 1.9.13 2.79.38 2.14-1.45 3.08-1.15 3.08-1.15.61 1.54.23 2.68.11 2.97.72.77 1.15 1.77 1.15 2.99 0 4.3-2.62 5.25-5.12 5.53.4.35.76 1.03.76 2.08v3.07c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z',
  linkedin:
    'M20.45 1H3.55A2.55 2.55 0 0 0 1 3.55v16.9A2.55 2.55 0 0 0 3.55 23h16.9A2.55 2.55 0 0 0 23 20.45V3.55A2.55 2.55 0 0 0 20.45 1ZM7.55 19.65H4.2V9h3.35ZM5.87 7.55A1.94 1.94 0 1 1 5.88 3.67a1.94 1.94 0 0 1 0 3.88ZM19.8 19.65h-3.34v-5.18c0-1.24-.03-2.83-1.73-2.83-1.73 0-2 1.35-2 2.74v5.27H9.4V9h3.2v1.46h.04a3.5 3.5 0 0 1 3.15-1.73c3.37 0 4 2.22 4 5.1Z',
};

const outlineIconComponents: Record<string, typeof FileText> = {
  file: FileText,
  folder: Folder,
  calendar: CalendarDays,
  award: Award,
  mail: Mail,
  settings: Settings,
  pipeline: GitBranch,
  play: Play,
  browser: PanelsTopLeft,
  network: Network,
  database: Database,
  list: List,
  brain: BrainCircuit,
  tool: Wrench,
  message: MessageSquare,
  down: ChevronDown,
  right: ChevronRight,
};

export function Icon({
  name,
  size = 20,
  className = '',
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  if (Object.hasOwn(brandPaths, name))
    return (
      <svg
        aria-hidden="true"
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d={brandPaths[name]} />
      </svg>
    );
  const Component = outlineIcon(name);
  return <Component aria-hidden="true" size={size} strokeWidth={1.6} className={className} />;
}

function outlineIcon(name: string) {
  return outlineIconComponents[name] ?? FileText;
}
