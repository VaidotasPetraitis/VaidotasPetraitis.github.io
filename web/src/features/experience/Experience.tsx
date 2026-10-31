import { experienceSchema } from './schema';
import { useFetchData } from '../../http/useFetchData';
import { ApiRequestStatus } from '../../http/ApiRequestStatus';

export function Experience() {
  const request = useFetchData('/api/v1/experience', experienceSchema);
  const entries = request.data;
  if (!entries)
    return (
      <>
        <h1 tabIndex={-1}>Experience</h1>
        <ApiRequestStatus {...request} label="experience" />
      </>
    );

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
                <time dateTime={entry.start}>{dateLabel(entry.start)}</time> —{' '}
                {entry.end ? <time dateTime={entry.end}>{dateLabel(entry.end)}</time> : 'Present'}
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

function dateLabel(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date.length === 7 ? date + '-01T00:00:00Z' : date + 'T00:00:00Z'));
}
