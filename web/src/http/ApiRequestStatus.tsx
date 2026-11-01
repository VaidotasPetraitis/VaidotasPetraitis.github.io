import type { UseQueryResult } from '@tanstack/react-query';
import type { APIError } from './api';

type ApiRequestStatusProps = Pick<
  UseQueryResult<unknown, APIError>,
  'isPending' | 'error' | 'refetch'
> & {
  label: string;
};

export function ApiRequestStatus(props: ApiRequestStatusProps) {
  if (props.error) {
    return (
      <div className="status error" role="alert">
        <h2>Unable to load {props.label}</h2>
        <p>{props.error.message}</p>
        <button className="text-button" onClick={() => props.refetch()}>
          Try again
        </button>
      </div>
    );
  }

  if (props.isPending) {
    return (
      <div className="status" role="status">
        <span className="loading-dot" /> Loading {props.label}…
      </div>
    );
  }

  return null;
}
