interface RunningManLoaderProps {
  label?: string;
  className?: string;
}

export function RunningManLoader({
  label = "Loading your finances…",
  className = "",
}: RunningManLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="running-track relative h-16 w-28 overflow-hidden">
        <div className="running-man-runner absolute bottom-0 left-0">
          <svg
            viewBox="0 0 64 64"
            className="running-man-bob size-12 text-primary"
            aria-hidden="true"
          >
            <circle cx="32" cy="10" r="6" fill="currentColor" />
            <path
              d="M32 16 L32 34 M32 22 L20 30 M32 22 L44 30 M32 34 L22 50 M32 34 L42 50"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
