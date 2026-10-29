import type { Experience as Entry } from '../../shared/models';
import { dateLabel } from '../../shared/dates';

export function Experience({ entries }: { entries: Entry[] }) {
  return (
    <article>
      <h1 tabIndex={-1}>Experience</h1>
      <div className="timeline">
        {entries.map((entry) => (
          <section className="timeline-entry" key={entry.id}>
            <div className="role-heading">
              <div>
                <h2>{entry.role}</h2>
                <p className="employer">{entry.organization}</p>
              </div>
              <p className="dates">
                <time dateTime={entry.start}>{dateLabel(entry.start, true)}</time> —{' '}
                {entry.end ? (
                  <time dateTime={entry.end}>{dateLabel(entry.end, true)}</time>
                ) : (
                  'Present'
                )}
              </p>
            </div>
            <p>{entry.description}</p>
            {entry.highlights.length > 0 && (
              <ul className="highlights">
                {entry.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
