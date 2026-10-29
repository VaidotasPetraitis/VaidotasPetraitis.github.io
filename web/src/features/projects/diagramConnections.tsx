import type { Project } from '../../shared/models';

type Connection = Project['diagram']['connections'][number];
type ConnectorProps = {
  connection?: Connection;
  markerId: string;
  stageCenterX: (id: string) => number;
};

function ArrowMarker({ id }: { id: string }) {
  return (
    <defs>
      <marker
        id={id}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto"
      >
        <path d="M1 1 9 5 1 9" />
      </marker>
    </defs>
  );
}

export function BypassConnector({ connection, markerId, stageCenterX }: ConnectorProps) {
  if (!connection) return null;
  const from = stageCenterX(connection.from);
  const to = stageCenterX(connection.to);
  return (
    <div className="diagram-bypass" aria-hidden="true">
      <svg viewBox="0 0 1000 40" preserveAspectRatio="none">
        <ArrowMarker id={markerId} />
        <path
          d={`M${from} 39 V13 Q${from} 5 ${from + 8} 5 H${to - 8} Q${to} 5 ${to} 13 V38`}
          markerEnd={`url(#${markerId})`}
        />
      </svg>
      <span>{connection.label}</span>
    </div>
  );
}

export function FeedbackConnector({ connection, markerId, stageCenterX }: ConnectorProps) {
  if (!connection) return null;
  const from = stageCenterX(connection.from);
  const to = stageCenterX(connection.to);
  return (
    <div className="diagram-feedback" aria-hidden="true">
      <svg viewBox="0 0 1000 36" preserveAspectRatio="none">
        <ArrowMarker id={markerId} />
        <path
          d={`M${from} 0 V17 Q${from} 25 ${from - 8} 25 H${to + 8} Q${to} 25 ${to} 17 V2`}
          markerEnd={`url(#${markerId})`}
        />
      </svg>
      <span>{connection.label}</span>
    </div>
  );
}

export function diagramClassName(hasBypass: boolean, hasFeedback: boolean) {
  return `project-diagram ${hasBypass ? 'has-bypass' : ''} ${hasFeedback ? 'has-feedback' : ''}`;
}

function forwardKind(connection: Connection) {
  return !connection.kind || connection.kind === 'forward';
}

export function hasForwardConnection(
  from: string,
  next: string | undefined,
  connections: Connection[],
) {
  if (!next) return false;
  return connections.some(
    (connection) => connection.from === from && connection.to === next && forwardKind(connection),
  );
}

export function FlowNote({ description, visible }: { description: string; visible: boolean }) {
  return visible ? <p className="mobile-flow-note">{description}</p> : null;
}
