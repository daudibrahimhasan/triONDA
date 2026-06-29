import { useEffect, useRef, useState } from "react";

interface Props {
  home: string;
  away: string;
  matches: number;
  onDone: () => void;
}

/** Fake-but-faithful console that mimics the real terminal run, then resolves. */
export default function RunConsole({ home, away, matches, onDone }: Props) {
  const lines = [
    { t: `$ predict ${home.toLowerCase()} vs ${away.toLowerCase()} --neutral`, c: "cmd" },
    { t: `› loading ${matches.toLocaleString()} internationals (2006–2026)…`, c: "" },
    { t: "› rebuilding point-in-time features (140+) — no leakage", c: "" },
    { t: "› Dixon-Coles score model: fitting attack/defence λ…", c: "" },
    { t: "› stacking ensemble: Form · Style · H2H · Elo · Neural → XGBoost", c: "" },
    { t: "› simulating 10,000 match outcomes…", c: "" },
    { t: "✓ prediction ready", c: "ok" },
  ];

  const [shown, setShown] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= lines.length) {
        window.clearInterval(id);
        if (!done.current) {
          done.current = true;
          window.setTimeout(onDone, 650);
        }
      }
    }, 480);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="console" role="status" aria-live="polite">
      <div className="console-bar">
        <span className="dot r" />
        <span className="dot y" />
        <span className="dot g" />
        <span className="console-title">wc2026 — predict</span>
      </div>
      <div className="console-body">
        {lines.slice(0, shown).map((l, idx) => (
          <div className={`cl ${l.c}`} key={idx}>
            {l.t}
            {idx === shown - 1 && shown < lines.length && <span className="caret" />}
          </div>
        ))}
      </div>
    </div>
  );
}
