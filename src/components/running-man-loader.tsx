import type { ReactNode } from "react";

interface RunningManLoaderProps {
  label?: string;
  className?: string;
}

const STROKE = 3.5;

function LimbSegment({
  className,
  length,
  children,
}: {
  className: string;
  length: number;
  children?: ReactNode;
}) {
  return (
    <g className={`runner-segment ${className}`}>
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={length}
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      {children}
    </g>
  );
}

/** Segmented figure with a four-phase run gait — stays centered, no horizontal slide. */
export function RunningManLoader({
  label = "Loading your finances…",
  className = "",
}: RunningManLoaderProps) {
  const upperArm = 11;
  const foreArm = 10;
  const thigh = 14;
  const calf = 13;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative flex h-28 w-28 items-end justify-center">
        <svg
          viewBox="0 0 64 64"
          className="runner-in-place size-[5rem] text-primary"
          aria-hidden="true"
        >
          <line
            x1="6"
            y1="59"
            x2="58"
            y2="59"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.2"
          />
          <ellipse
            cx="34"
            cy="59"
            rx="11"
            ry="2.5"
            className="runner-shadow"
            fill="currentColor"
            opacity="0.18"
          />
          <g className="runner-figure">
            <circle cx="34" cy="11" r="5.5" fill="currentColor" />
            <path
              d="M34 16.5 L31 33"
              stroke="currentColor"
              strokeWidth={STROKE}
              strokeLinecap="round"
            />

            <g transform="translate(29 20)">
              <LimbSegment className="runner-arm-l-upper" length={upperArm}>
                <g transform={`translate(0 ${upperArm})`}>
                  <LimbSegment className="runner-arm-l-fore" length={foreArm} />
                </g>
              </LimbSegment>
            </g>

            <g transform="translate(33 20)">
              <LimbSegment className="runner-arm-r-upper" length={upperArm}>
                <g transform={`translate(0 ${upperArm})`}>
                  <LimbSegment className="runner-arm-r-fore" length={foreArm} />
                </g>
              </LimbSegment>
            </g>

            <g transform="translate(29 33)">
              <LimbSegment className="runner-leg-l-thigh" length={thigh}>
                <g transform={`translate(0 ${thigh})`}>
                  <LimbSegment className="runner-leg-l-calf" length={calf} />
                </g>
              </LimbSegment>
            </g>

            <g transform="translate(33 33)">
              <LimbSegment className="runner-leg-r-thigh" length={thigh}>
                <g transform={`translate(0 ${thigh})`}>
                  <LimbSegment className="runner-leg-r-calf" length={calf} />
                </g>
              </LimbSegment>
            </g>
          </g>
        </svg>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
