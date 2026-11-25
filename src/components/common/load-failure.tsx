import { Button } from "@/components/ui/button";

export function LoadFailure({ title, message, onRetry }: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="space-y-2 py-3">
      {title && <p className="text-sm font-semibold">{title}</p>}
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
