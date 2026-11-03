import { type Experience as ExperienceRecord } from './schema';
import { getExperience } from './service';
import { ApiRequestStatus } from '../../http/ApiRequestStatus';
import { useRequest } from '../../http/useRequest';

export function Experience() {
  const request = useRequest(getExperience);
  const entries = request.data;

  if (!entries) {
    return (
      <>
        <h1>Experience</h1>
        <ApiRequestStatus {...request} label="experience" />
      </>
    );
  }

  return (
    <article>
      <h1>Experience</h1>
      <div className="timeline">
        {entries.map((entry) => (
          <ExperienceEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </article>
  );
}

type ExperienceEntryProps = {
  entry: ExperienceRecord;
};

function ExperienceEntry(props: ExperienceEntryProps) {
  return (
    <section className="timeline-entry">
      <div className="role-heading">
        <div>
          <h2>{props.entry.role}</h2>
          <p className="employer">{props.entry.organization}</p>
        </div>
        <p className="dates">
          <time dateTime={props.entry.start}>{formatDate(props.entry.start)}</time> —{' '}
          {props.entry.end ? (
            <time dateTime={props.entry.end}>{formatDate(props.entry.end)}</time>
          ) : (
            'Present'
          )}
        </p>
      </div>
      <p>{props.entry.description}</p>
      {props.entry.highlights.length > 0 && (
        <ul className="highlights">
          {props.entry.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date.length === 7 ? date + '-01T00:00:00Z' : date + 'T00:00:00Z'));
}
