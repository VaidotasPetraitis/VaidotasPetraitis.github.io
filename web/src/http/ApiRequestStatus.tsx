import type { APIError } from './ApiError';

export function ApiRequestStatus({
  loading,
  error,
  retry,
  label,
}: {
  loading: boolean;
  error?: APIError;
  retry: () => void;
  label: string;
}) {
  if (error)
    return (
      <div className="status error" role="alert">
        <h2>Unable to load {label}</h2>
        <p>{error.message}</p>
        <button className="text-button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  if (loading)
    return (
      <div className="status" role="status">
        <span className="loading-dot" /> Loading {label}…
      </div>
    );
  return null;
}
