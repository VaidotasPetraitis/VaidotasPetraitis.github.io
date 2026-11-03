import type { ApiError } from './result';

type ApiRequestStatusProps = {
  loading: boolean;
  error?: ApiError;
  retry: () => void;
  label: string;
};

export function ApiRequestStatus({ loading, error, retry, label }: ApiRequestStatusProps) {
  if (loading) {
    return (
      <div className="status" role="status">
        <span className="loading-dot" /> Loading {label}…
      </div>
    );
  }

  if (error) {
    return (
      <div className="status error" role="alert">
        <h2>Unable to load {label}</h2>
        <p>{error.message}</p>
        <button className="text-button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }

  return null;
}
