interface RunningManLoaderProps {
  label?: string;
  className?: string;
}

/** Stick figure with limbs pivoted at shoulder/hip — runs in place (no horizontal motion). */
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
      <div className="relative flex h-24 w-24 items-end justify-center">
        <svg
          viewBox="0 0 64 64"
          className="runner-in-place size-[4.5rem] text-primary"
          aria-hidden="true"
        >
          <line
            x1="8"
            y1="58"
            x2="56"
            y2="58"
            className="runner-ground"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.25"
          />
          <ellipse
            cx="32"
            cy="58"
            rx="10"
            ry="2"
            className="runner-shadow"
            fill="currentColor"
            opacity="0.2"
          />
          <g className="runner-figure">
            <circle cx="32" cy="12" r="6" fill="currentColor" />
            <path
              d="M32 18 L30 36"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <g className="runner-limb runner-arm-left" transform="translate(30 22)">
              <path
                d="M0 0 L-14 10"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>
            <g className="runner-limb runner-arm-right" transform="translate(30 22)">
              <path
                d="M0 0 L14 10"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>
            <g className="runner-limb runner-leg-left" transform="translate(30 36)">
              <path
                d="M0 0 L-10 18"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>
            <g className="runner-limb runner-leg-right" transform="translate(30 36)">
              <path
                d="M0 0 L10 18"
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
