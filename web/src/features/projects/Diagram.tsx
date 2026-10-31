import { useId } from 'react';
import { ArrowRight } from 'lucide-react';
import { Icon } from '../../icons/Icons';
import type { Project } from './schema';
import {
  BypassConnector,
  FeedbackConnector,
  diagramClassName,
  hasForwardConnection,
  FlowNote,
} from './diagramConnections';

export function Diagram({ diagram }: { diagram: Project['diagram'] }) {
  const id = useId().replaceAll(':', '');
  const feedback = diagram.connections.find((connection) => connection.kind === 'feedback');
  const bypass = diagram.connections.find((connection) => connection.kind === 'bypass');
  // Connectors meet column centers on the same 1000-unit SVG canvas.
  const stageCenterX = (stageId: string) =>
    ((diagram.stages.findIndex((stage) => stage.id === stageId) + 0.5) * 1000) /
    diagram.stages.length;
  const hasExtraConnections = Boolean(feedback ?? bypass);
  return (
    <figure
      className={diagramClassName(Boolean(bypass), Boolean(feedback))}
      aria-label={diagram.description}
    >
      <figcaption className="sr-only">{diagram.description}</figcaption>
      <BypassConnector connection={bypass} markerId={`bypass-${id}`} stageCenterX={stageCenterX} />
      <div
        className="diagram-stages"
        style={{ gridTemplateColumns: `repeat(${diagram.stages.length}, minmax(0, 1fr))` }}
      >
        {diagram.stages.map((stage, index) => {
          const next = diagram.stages[index + 1];
          const linked = hasForwardConnection(stage.id, next?.id, diagram.connections);
          return (
            <div className="diagram-stage" key={stage.id}>
              <div className="diagram-node">
                <Icon name={stage.icon} size={27} />
                <span>{stage.label}</span>
              </div>
              <p>{stage.caption}</p>
              {linked && (
                <ArrowRight className="stage-arrow" size={30} strokeWidth={1} aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
      <FeedbackConnector
        connection={feedback}
        markerId={`feedback-${id}`}
        stageCenterX={stageCenterX}
      />
      <FlowNote description={diagram.description} visible={hasExtraConnections} />
    </figure>
  );
}
