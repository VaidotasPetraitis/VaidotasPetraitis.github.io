import { certificationsSchema, type Certification } from './schema';
import { ArrowUpRight } from 'lucide-react';
import { useFetchData } from '../../http/useFetchData';
import { ApiRequestStatus } from '../../http/ApiRequestStatus';

export function Certifications() {
  const request = useFetchData('/api/v1/certifications', certificationsSchema);
  const entries = request.data;
  if (!entries)
    return (
      <>
        <h1 tabIndex={-1}>Certifications</h1>
        <ApiRequestStatus {...request} label="certifications" />
      </>
    );

  return (
    <article>
      <h1 tabIndex={-1}>Certifications</h1>
      <div className="credentials">
        {entries.map((entry) => (
          <Credential key={entry.id} entry={entry} />
        ))}
      </div>
    </article>
  );
}

function Credential({ entry }: { entry: Certification }) {
  return (
    <section className="credential">
      <h2>{entry.title}</h2>
      <p className="issuer">{entry.issuer}</p>
      <CredentialDate entry={entry} />
      <CredentialMetadata entry={entry} />
      <a className="external-link" href={entry.url} target="_blank" rel="noopener noreferrer">
        View {entry.issuer === 'Microsoft' ? 'Microsoft' : 'Credly'} credential
        <ArrowUpRight size={15} aria-hidden="true" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </section>
  );
}

function CredentialDate({ entry }: { entry: Certification }) {
  return (
    <p className="credential-date">
      Issued <time dateTime={entry.issued}>{dateLabel(entry.issued)}</time>
      {entry.expiry && (
        <>
          {' '}
          · Expires <time dateTime={entry.expiry}>{dateLabel(entry.expiry)}</time>
        </>
      )}
    </p>
  );
}

function CredentialMetadata({ entry }: { entry: Certification }) {
  return (
    <>
      {entry.credentialId && <p className="credential-id">Credential ID: {entry.credentialId}</p>}
      {entry.description && <p className="credential-description">{entry.description}</p>}
    </>
  );
}

function dateLabel(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date.length === 7 ? date + '-01T00:00:00Z' : date + 'T00:00:00Z'));
}
