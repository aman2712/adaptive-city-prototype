export default function AgentGlyph({ type, className = "" }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const glyphs = {
    data: (
      <>
        <circle cx="12" cy="12" r="8" {...common} />
        <circle cx="12" cy="12" r="3" {...common} />
      </>
    ),
    solutions: (
      <>
        <path d="M9 18h6" {...common} />
        <path d="M10 22h4" {...common} />
        <path d="M8 10a4 4 0 1 1 8 0c0 2-1 3-2 4s-1 2-1 3h-2c0-1 0-2-1-3s-2-2-2-4z" {...common} />
      </>
    ),
    finance: (
      <>
        <ellipse cx="12" cy="7" rx="6" ry="3" {...common} />
        <path d="M6 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7" {...common} />
        <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" {...common} />
      </>
    ),
    regulatory: (
      <>
        <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" {...common} />
        <path d="M9 12l2 2 4-4" {...common} />
      </>
    ),
    ops: (
      <>
        <circle cx="12" cy="12" r="3" {...common} />
        <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1L14 3h-4l-.8 2.5a7 7 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1L10 21h4l.8-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.6.1-1z" {...common} />
      </>
    ),
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
    >
      {glyphs[type] || glyphs.data}
    </svg>
  );
}
