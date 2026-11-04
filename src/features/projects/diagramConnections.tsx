import type { Project } from './schema';

type Connection = Project['diagram']['connections'][number];
type ConnectorProps = {
  connection?: Connection;
  markerId: string;
  stageCenterX: (id: string) => number;
};

type ArrowMarkerProps = {
  id: string;
};

function ArrowMarker(props: ArrowMarkerProps) {
  return (
    <defs>
      <marker
        id={props.id}
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

export function BypassConnector(props: ConnectorProps) {
  if (!props.connection) {
    return null;
  }

  const from = props.stageCenterX(props.connection.from);
  const to = props.stageCenterX(props.connection.to);

  return (
    <div className="diagram-bypass" aria-hidden="true">
      <svg viewBox="0 0 1000 40" preserveAspectRatio="none">
        <ArrowMarker id={props.markerId} />
        <path
          d={`M${from} 39 V13 Q${from} 5 ${from + 8} 5 H${to - 8} Q${to} 5 ${to} 13 V38`}
          markerEnd={`url(#${props.markerId})`}
        />
      </svg>
      <span>{props.connection.label}</span>
    </div>
  );
}

export function FeedbackConnector(props: ConnectorProps) {
  if (!props.connection) {
    return null;
  }

  const from = props.stageCenterX(props.connection.from);
  const to = props.stageCenterX(props.connection.to);

  return (
    <div className="diagram-feedback" aria-hidden="true">
      <svg viewBox="0 0 1000 36" preserveAspectRatio="none">
        <ArrowMarker id={props.markerId} />
        <path
          d={`M${from} 0 V17 Q${from} 25 ${from - 8} 25 H${to + 8} Q${to} 25 ${to} 17 V2`}
          markerEnd={`url(#${props.markerId})`}
        />
      </svg>
      <span>{props.connection.label}</span>
    </div>
  );
}

function forwardKind(connection: Connection) {
  return !connection.kind || connection.kind === 'forward';
}

export function hasForwardConnection(
  from: string,
  next: string | undefined,
  connections: Connection[],
) {
  if (!next) {
    return false;
  }

  return connections.some(
    (connection) => connection.from === from && connection.to === next && forwardKind(connection),
  );
}
