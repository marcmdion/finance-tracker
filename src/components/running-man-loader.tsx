interface RunningManLoaderProps {
  label?: string;
  className?: string;
}

/** HTML/CSS runner — animates reliably on iOS Safari; soft minimal silhouette. */
export function RunningManLoader({
  label = "Loading your finances…",
  className = "",
}: RunningManLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-5 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className="runner-scene text-foreground/42 dark:text-foreground/55"
        aria-hidden="true"
      >
        <div className="runner-bob">
          <div className="runner-head" />
          <div className="runner-torso" />

          <div className="runner-limb runner-arm-l">
            <div className="runner-limb runner-fore-l" />
          </div>
          <div className="runner-limb runner-arm-r">
            <div className="runner-limb runner-fore-r" />
          </div>

          <div className="runner-limb runner-thigh-l">
            <div className="runner-limb runner-shin-l" />
          </div>
          <div className="runner-limb runner-thigh-r">
            <div className="runner-limb runner-shin-r" />
          </div>
        </div>
      </div>

      <p className="max-w-[16rem] text-center text-xs tracking-[0.06em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
