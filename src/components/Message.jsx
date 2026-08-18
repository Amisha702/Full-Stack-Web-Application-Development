export function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
      {message}
    </div>
  );
}

export function SuccessMessage({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success">
      {message}
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="px-4 py-12 text-center text-sm text-muted-foreground">{message}</div>
  );
}