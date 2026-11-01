import { certificationsSchema, type Certification } from './schema';
import { ArrowUpRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiQuery } from '../../http/api';
import { ApiRequestStatus } from '../../http/ApiRequestStatus';

export function Certifications() {
  const request = useQuery(apiQuery('/api/v1/certifications', certificationsSchema));
  const entries = request.data;

  if (!entries) {
    return (
      <>
        <h1>Certifications</h1>
        <ApiRequestStatus {...request} label="certifications" />
      </>
    );
  }

  return (
    <article>
      <h1>Certifications</h1>
      <div className="credentials">
        {entries.map((entry) => (
          <Credential key={entry.id} entry={entry} />
        ))}
      </div>
    </article>
  );
}

type CredentialProps = {
  entry: Certification;
};

function Credential(props: CredentialProps) {
  return (
    <section className="credential">
      <h2>{props.entry.title}</h2>
      <p className="issuer">{props.entry.issuer}</p>
      <CredentialDate entry={props.entry} />
      {props.entry.credentialId && (
        <p className="credential-id">Credential ID: {props.entry.credentialId}</p>
      )}
      {props.entry.description && (
        <p className="credential-description">{props.entry.description}</p>
      )}
      <a className="external-link" href={props.entry.url} target="_blank" rel="noopener noreferrer">
        View {props.entry.issuer === 'Microsoft' ? 'Microsoft' : 'Credly'} credential
        <ArrowUpRight size={15} aria-hidden="true" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </section>
  );
}

type CredentialDateProps = {
  entry: Certification;
};

function CredentialDate(props: CredentialDateProps) {
  return (
    <p className="credential-date">
      Issued <time dateTime={props.entry.issued}>{formatDate(props.entry.issued)}</time>
      {props.entry.expiry && (
        <>
          {' '}
          · Expires <time dateTime={props.entry.expiry}>{formatDate(props.entry.expiry)}</time>
        </>
      )}
    </p>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date.length === 7 ? date + '-01T00:00:00Z' : date + 'T00:00:00Z'));
}
