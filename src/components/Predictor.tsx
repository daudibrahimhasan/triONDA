import { useEffect, useMemo, useRef, useState } from "react";
import type { Meta, Pred, Scorer, TeamInfo } from "../types";
import { Flag } from "../flags";
import RunConsole from "./RunConsole";

interface Props {
  teams: TeamInfo[];
  preds: Record<string, Pred>;
  meta: Meta;
  opponents: Record<string, string>;
  onRun?: (home: string, away: string) => void;
}

type Phase = "idle" | "running" | "result";

export default function Predictor({ teams, preds, meta, opponents, onRun }: Props) {
  const first = teams[0]?.name ?? "";
  const [home, setHome] = useState(first);
  const [away, setAway] = useState(opponents[first] ?? teams[1]?.name ?? "");
  const [phase, setPhase] = useState<Phase>("idle");
  const [grown, setGrown] = useState(false);

  const same = home === away;

  function run() {
    if (same) return;
    onRun?.(home, away); // lights up this exact tie in the bracket (if they meet)
    setPhase("running");
  }

  // Grow the probability bars from zero once the result mounts.
  useEffect(() => {
    if (phase !== "result") {
      setGrown(false);
      return;
    }
    const id = window.setTimeout(() => setGrown(true), 60);
    return () => window.clearTimeout(id);
  }, [phase, home, away]);

  // Resolve the prediction, oriented so `home` is the left side of the bar.
  const result = useMemo(() => {
    if (same) return null;
    const [l, r] = [home, away].sort();
    const p = preds[`${l}|${r}`];
    if (!p) return null;
    const homeIsLeft = l === home;
    const pHome = homeIsLeft ? p.pa : p.pb;
    const pAway = homeIsLeft ? p.pb : p.pa;
    const [gl, gr] = p.s.split("-");
    const score = homeIsLeft ? `${gl}-${gr}` : `${gr}-${gl}`;
    const scHome = homeIsLeft ? p.sa : p.sb;
    const scAway = homeIsLeft ? p.sb : p.sa;
    const alt = (p.alt || []).map((sc) => {
      if (homeIsLeft) return sc;
      const [x, y] = sc.split("-");
      return `${y}-${x}`;
    });
    const top = Math.max(pHome, p.pd, pAway);
    const who = top === p.pd ? "Draw" : top === pHome ? home : away;
    return { pHome, pDraw: p.pd, pAway, score, alt, scHome, scAway, who, why: p.why };
  }, [home, away, same, preds]);

  return (
    <section className="card predictor accent-green">
      <h2 className="card-title">Predict any matchup</h2>

      <div className="pick">
        <TeamPicker teams={teams} value={home} onChange={(v) => { setHome(v); if (opponents[v]) setAway(opponents[v]); setPhase("idle"); }} />
        <span className="vs">VS</span>
        <TeamPicker teams={teams} value={away} onChange={(v) => { setAway(v); setPhase("idle"); }} />
      </div>

      <button className="run" onClick={run} disabled={same}>
        {same ? "Pick two different teams" : phase === "running" ? "Running…" : "▶  Run the model"}
      </button>

      {phase === "running" && (
        <RunConsole home={home} away={away} matches={meta.matches} onDone={() => setPhase("result")} />
      )}

      {phase === "result" && result && (
        <div className="result">
          <div className="verdict">
            {result.who === "Draw" ? (
              <span className="verdict-line">🤝 {result.why}</span>
            ) : (
              <>
                <span className="medal">🏆</span>
                <span className="verdict-team"><Flag name={result.who} size={26} /> {result.who}</span>
                <span className="verdict-sub">{result.why}</span>
              </>
            )}
          </div>

          <div className="bar">
            <div className="bh" style={{ flexGrow: grown ? Math.max(result.pHome, 1) : 0.0001 }}>
              <Flag name={home} size={15} /> {result.pHome}%
            </div>
            <div className="bd" style={{ flexGrow: grown ? Math.max(result.pDraw, 1) : 0.0001 }}>Draw {result.pDraw}%</div>
            <div className="ba" style={{ flexGrow: grown ? Math.max(result.pAway, 1) : 0.0001 }}>
              <Flag name={away} size={15} /> {result.pAway}%
            </div>
          </div>

          <div className="score">
            <small>most likely score</small>
            <div className="score-row">
              {result.alt[0] && <span className="alt-score">{result.alt[0]}</span>}
              <span className="main-score"><Flag name={home} size={20} /> {result.score} <Flag name={away} size={20} /></span>
              {result.alt[1] && <span className="alt-score">{result.alt[1]}</span>}
            </div>
          </div>

          <div className="scorers">
            <ScorerCol team={home} list={result.scHome} />
            <ScorerCol team={away} list={result.scAway} />
          </div>
        </div>
      )}
    </section>
  );
}

function TeamPicker({ teams, value, onChange }: { teams: TeamInfo[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="picker" ref={ref}>
      <button type="button" className="picker-btn" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="picker-cur"><Flag name={value} size={18} /> {value}</span>
        <span className="picker-chev" aria-hidden>▾</span>
      </button>
      {open && (
        <ul className="picker-menu" role="listbox">
          {teams.map((t) => (
            <li
              key={t.name}
              role="option"
              aria-selected={t.name === value}
              className={`picker-opt ${t.name === value ? "sel" : ""}`}
              onClick={() => { onChange(t.name); setOpen(false); }}
            >
              <Flag name={t.name} size={16} /> {t.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ScorerCol({ team, list }: { team: string; list: Scorer[] }) {
  return (
    <div className="scol">
      <b><Flag name={team} size={16} /> {team}</b>
      {list.length === 0 ? (
        <div className="srow muted">—</div>
      ) : (
        list.map(([name, p]) => (
          <div className="srow" key={name}>
            <span>{name}</span>
            <span className="sprob">{p}%</span>
          </div>
        ))
      )}
    </div>
  );
}
