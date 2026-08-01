interface MinimalLoaderProps {
  label?: string;
  className?: string;
}

/** Three-dot wave — visible motion on mobile Safari. */
export function MinimalLoader({
  label = "Loading your finances…",
  className = "",
}: MinimalLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-5 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="loader-dots" aria-hidden="true">
        <span className="loader-dot" />
        <span className="loader-dot" />
        <span className="loader-dot" />
      </div>
      <p className="max-w-[16rem] text-center text-xs tracking-[0.06em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
