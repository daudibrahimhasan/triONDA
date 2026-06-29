type Panel = "awards" | "bracket" | "predict" | "about";

interface Props {
  onOpen: (panel: Panel) => void;
}

/* Chalk-line icons — same thin-stroke language as the hero's drawn pitch lines */
const ICONS: Record<Panel, JSX.Element> = {
  awards: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4h10v4.5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5v1A3 3 0 0 0 7 10M17 6h2.5v1A3 3 0 0 1 17 10" />
      <path d="M12 13.5V17M9 20h6M10.5 17h3" />
    </svg>
  ),
  bracket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4v5h5" />
      <path d="M4 20v-5h5" />
      <path d="M9 9v6" />
      <path d="M9 12h4" />
      <path d="M13 7v10h6" />
    </svg>
  ),
  predict: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10 8.5l6 3.5-6 3.5V8.5Z" />
    </svg>
  ),
  about: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <path d="M12 7.6h.01" />
    </svg>
  ),
};

const BLOCKS: { key: Panel; title: string; accent: string }[] = [
  { key: "bracket", title: "Bracket", accent: "var(--violet)"   },
  { key: "about",   title: "About",   accent: "var(--red)"      },
  { key: "awards",  title: "Awards",  accent: "var(--lime)"     },
  { key: "predict", title: "Run",     accent: "var(--wc-green)" },
];

export default function BlockNav({ onOpen }: Props) {
  return (
    <nav className="block-nav" aria-label="Sections">
      {BLOCKS.map((b) => (
        <button
          key={b.key}
          className="block"
          style={{ "--block-accent": b.accent } as React.CSSProperties}
          onClick={() => onOpen(b.key)}
        >
          <span className="block-icon">{ICONS[b.key]}</span>
          <span className="block-title">{b.title}</span>
        </button>
      ))}
    </nav>
  );
}
