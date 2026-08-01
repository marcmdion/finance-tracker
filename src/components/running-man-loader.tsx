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
      <div className="flex h-20 w-20 items-end justify-center">
        <svg
          viewBox="0 0 64 64"
          className="runner-in-place size-16 text-primary"
          aria-hidden="true"
        >
          <g className="runner-bob">
            <circle cx="32" cy="11" r="6" fill="currentColor" />
            <path
              d="M32 17 L32 36"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <g className="runner-arm runner-arm-left">
              <path
                d="M32 22 L20 30"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>
            <g className="runner-arm runner-arm-right">
              <path
                d="M32 22 L44 30"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>
            <g className="runner-leg runner-leg-left">
              <path
                d="M32 36 L22 52"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>
            <g className="runner-leg runner-leg-right">
              <path
                d="M32 36 L42 52"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </g>
        </svg>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
