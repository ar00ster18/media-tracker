export function Spinner({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full border-4 border-slate-900 border-t-transparent ${className}`}></div>
  );
}
