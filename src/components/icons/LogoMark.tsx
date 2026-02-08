export function LogoMark() {
  return (
    <svg viewBox="0 0 128 128" role="img" aria-label="FisikaSeru" className="h-9 w-9">
      <defs>
        <linearGradient id="fs-grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="112" height="112" rx="24" fill="url(#fs-grad)" />
      <path d="M33 36h56v10H44v15h34v10H44v21H33V36Z" fill="white" />
    </svg>
  );
}
