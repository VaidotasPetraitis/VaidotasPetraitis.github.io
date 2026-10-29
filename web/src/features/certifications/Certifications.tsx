import type { Certification } from '../../shared/models';
import { dateLabel } from '../../shared/dates';
import { ArrowUpRight } from 'lucide-react';

export function Certifications({ entries }: { entries: Certification[] }) {
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
