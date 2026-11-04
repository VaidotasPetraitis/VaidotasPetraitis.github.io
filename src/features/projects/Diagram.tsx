import { useId } from 'react';
import { ArrowRight } from 'lucide-react';
import { Icon } from '../../icons/Icons';
import type { Project } from './schema';
import { BypassConnector, FeedbackConnector, hasForwardConnection } from './diagramConnections';

type DiagramProps = {
  diagram: Project['diagram'];
};

export function Diagram(props: DiagramProps) {
  const id = useId().replaceAll(':', '');
  const feedback = props.diagram.connections.find((connection) => connection.kind === 'feedback');
  const bypass = props.diagram.connections.find((connection) => connection.kind === 'bypass');
  const stageCenterX = (stageId: string) =>
    ((props.diagram.stages.findIndex((stage) => stage.id === stageId) + 0.5) * 1000) /
    props.diagram.stages.length;
  const classNames = ['project-diagram'];

  if (bypass) {
    classNames.push('has-bypass');
  }

  if (feedback) {
    classNames.push('has-feedback');
  }

  return (
    <figure className={classNames.join(' ')} aria-label={props.diagram.description}>
      <figcaption className="sr-only">{props.diagram.description}</figcaption>
      <BypassConnector connection={bypass} markerId={`bypass-${id}`} stageCenterX={stageCenterX} />
      <div
        className="diagram-stages"
        style={{ gridTemplateColumns: `repeat(${props.diagram.stages.length}, minmax(0, 1fr))` }}
      >
        {props.diagram.stages.map((stage, index) => {
          const next = props.diagram.stages[index + 1];
          const linked = hasForwardConnection(stage.id, next?.id, props.diagram.connections);

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
      {classNames.length > 1 && <p className="mobile-flow-note">{props.diagram.description}</p>}
    </figure>
  );
}
