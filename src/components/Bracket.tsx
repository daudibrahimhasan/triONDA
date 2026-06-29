import { useEffect, useMemo, useState } from "react";
import type { BracketRow, Pred } from "../types";
import { Flag, teamKey } from "../flags";

/**
 * Two-sided knockout bracket. Shows the empty Round-of-32 structure; when the
 * model is run on a matchup, ONLY that tie lights up with its result (if the two
 * teams actually meet somewhere in the projected bracket).
 */

const LEFT = { r32: [74, 77, 73, 75, 83, 84, 81, 82], r16: [89, 90, 93, 94], qf: [97, 98], sf: [101] };
const RIGHT = { r32: [76, 78, 79, 80, 86, 88, 85, 87], r16: [91, 92, 95, 96], qf: [99, 100], sf: [102] };

// Which two matches feed each later-round tie (so a decided match's winner shows
// up in the next round).
const FEEDERS: Record<number, [number, number]> = {
  89: [74, 77], 90: [73, 75], 91: [76, 78], 92: [79, 80],
  93: [83, 84], 94: [81, 82], 95: [86, 88], 96: [85, 87],
  97: [89, 90], 98: [93, 94], 99: [91, 92], 100: [95, 96],
  101: [97, 98], 102: [99, 100], 104: [101, 102],
};

function levelOf(no: number): number {
  if (no <= 88) return 1;
  if (no <= 96) return 2;
  if (no <= 100) return 3;
  if (no <= 102) return 4;
  return 5;
}

// Match numbers in each round, and the name of the round that must finish first.
const LEVEL_NOS: Record<number, number[]> = {
  1: [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88],
  2: [89, 90, 91, 92, 93, 94, 95, 96],
  3: [97, 98, 99, 100],
  4: [101, 102],
  5: [103, 104],
};
const PREV_ROUND_LABEL: Record<number, string> = {
  2: "Round of 32", 3: "Round of 16", 4: "Quarter-finals", 5: "Semi-finals",
};

// Shared state passed to the (module-scope) Slot/Col so their function identity
// stays stable — otherwise defining them inside Bracket's render remounts the
// whole bracket on every tap (restarting animations, dropping keyboard focus).
interface SlotCtx {
  byNo: Record<number, BracketRow>;
  activeNo: number | null;
  revealed: Set<number>;
  openNo: number | null;
  view: "predicted" | "real";
  reveal: (n: number) => void;
  twoScores: (m: BracketRow) => string;
}

function Slot({ no, ctx }: { no: number; ctx: SlotCtx }) {
  const { byNo, activeNo, revealed, openNo, view, reveal, twoScores } = ctx;
  const m = byNo[no];
  const isR32 = levelOf(no) === 1;
  const active = no === activeNo;
  const played = !!(m && m.played); // real result entered via update_ko.py
  const rvl = revealed.has(no);     // clicked to reveal
  const isPredicted = view === "predicted";
  const feeders = FEEDERS[no];
  // In Real view a slot only fills from a genuinely PLAYED feeder; in Predicted
  // view it also fills from a run (active) or a tap (revealed).
  const dec = (x: number) =>
    isPredicted ? (x === activeNo || revealed.has(x) || !!byNo[x]?.played) : !!byNo[x]?.played;
  const baseShown = isR32 || played || (isPredicted && (active || rvl));
  const homeReady = baseShown || (!!feeders && dec(feeders[0]));
  const awayReady = baseShown || (!!feeders && dec(feeders[1]));
  const teamsShown = homeReady || awayReady;
  if (!m || !teamsShown) {
    return (
      <div
        className="tie empty"
        role={m ? "button" : undefined}
        tabIndex={m ? 0 : undefined}
        onClick={(e) => { e.stopPropagation(); if (m) reveal(no); }}
        onKeyDown={(e) => { if (m && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); reveal(no); } }}
      >
        <div className="tline"><span className="tname q">—</span></div>
        <div className="tline"><span className="tname q">—</span></div>
      </div>
    );
  }
  const open = openNo === no;
  // Real view ONLY shows genuinely played results — never the model's prediction.
  // Predicted view reveals the model's call on run (active) / tap (rvl) / played.
  const useReal = played && !isPredicted && !!m.realScore;
  const decided = isPredicted ? (active || played || rvl) : useReal;
  const sc = useReal ? (m.realScore as string) : m.score;
  const wn = useReal ? (m.realWinner as string) : m.winner;
  const [gh = "", ga = ""] = sc.split("-");
  const pens = decided && gh === ga && gh !== "";
  const homeWin = wn === m.home;
  // Unplayed predicted winners get a subtle green. Once a match is PLAYED, its
  // winner is deep green if the model called it right, red if wrong — in BOTH views.
  const modelRight = m.realWinner === m.winner;
  const winCls = (isWinner: boolean) => {
    if (!decided) return "";
    if (!isWinner) return "lose";
    if (played) return modelRight ? "win correct" : "win wrong";
    return "win";
  };
  return (
    <div
      className={`tie ${decided ? "done" : ""} ${active ? "active" : ""} ${useReal ? "real" : ""} ${open ? "open" : ""}`}
      role="button"
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); reveal(no); }}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reveal(no); } }}
    >
      <div className={`tline ${winCls(homeWin)}`}>
        {homeReady
          ? <span className="tname"><Flag name={m.home} size={15} /> {m.home}</span>
          : <span className="tname q">—</span>}
        {decided && <span className="tgoal">{gh}{pens && homeWin ? <i className="pk">P</i> : null}</span>}
      </div>
      <div className={`tline ${winCls(!homeWin)}`}>
        {awayReady
          ? <span className="tname"><Flag name={m.away} size={15} /> {m.away}</span>
          : <span className="tname q">—</span>}
        {decided && <span className="tgoal">{ga}{pens && !homeWin ? <i className="pk">P</i> : null}</span>}
      </div>
      {open && decided && (
        <div className="why-bubble">
          <div className="wb-line">Predicted <b>{twoScores(m)}</b></div>
          <div className="wb-why">{m.why}</div>
        </div>
      )}
    </div>
  );
}

function Col({ nos, label, ctx }: { nos: number[]; label: string; ctx: SlotCtx }) {
  return (
    <div className="bcol">
      <div className="bcol-head">{label}</div>
      <div className="bcol-body">{nos.map((n) => <Slot key={n} no={n} ctx={ctx} />)}</div>
    </div>
  );
}

export default function Bracket({
  rows,
  champion,
  run,
  preds,
}: {
  rows: BracketRow[];
  champion: string;
  run: { home: string; away: string; nonce: number };
  preds: Record<string, Pred>;
}) {
  const byNo = useMemo(() => {
    const m: Record<number, BracketRow> = {};
    rows.forEach((r) => (m[r.no] = r));
    return m;
  }, [rows]);

  const [activeNo, setActiveNo] = useState<number | null>(null);
  const [openNo, setOpenNo] = useState<number | null>(null); // which tie's why-bubble is open
  const [view, setView] = useState<"predicted" | "real">("real"); // bracket display mode
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const [msg, setMsg] = useState(""); // lock message when a future round is tapped

  // A round only unlocks once the previous round is fully played.
  const roundOpen = (level: number) =>
    level <= 1 || LEVEL_NOS[level - 1].every((n) => byNo[n]?.played);

  // Is this tie's score already on screen? (played / run / first-tap revealed)
  const scoreShown = (n: number) => {
    const m = byNo[n];
    if (!m) return false;
    if (view === "real") return !!(m.played && m.realScore);
    return n === activeNo || !!m.played || revealed.has(n);
  };

  // Two-stage tap: 1st tap reveals the SCORE, 2nd tap reveals the WHY bubble.
  const reveal = (n: number) => {
    const lvl = levelOf(n);
    if (!roundOpen(lvl)) {
      setMsg(`Wait for the ${PREV_ROUND_LABEL[lvl]} to be over.`);
      return;
    }
    setMsg("");
    if (!scoreShown(n)) {
      setRevealed((s) => { const x = new Set(s); x.add(n); return x; });
      setOpenNo(null);
    } else {
      setOpenNo((o) => (o === n ? null : n));
    }
  };

  // Two hedged predicted scores ("0-1 or 1-1") — primary + one alternative from preds.
  const twoScores = (m: BracketRow) => {
    const primary = m.score;
    const [l, r] = [m.home, m.away].slice().sort();
    const p = preds[`${l}|${r}`];
    if (!p) return primary;
    const flip = (sc: string) => { const [x, y] = sc.split("-"); return `${y}-${x}`; };
    const homeIsLeft = l === m.home;
    const alts = (p.alt || []).map((sc) => (homeIsLeft ? sc : flip(sc)));
    const second = alts.find((sc) => sc !== primary);
    return second ? `${primary} or ${second}` : primary;
  };

  // On each run, find the tie where these two teams meet and light only that one.
  useEffect(() => {
    if (run.nonce <= 0) return;
    const k1 = teamKey(run.home);
    const k2 = teamKey(run.away);
    const match = rows.find((r) => {
      const a = teamKey(r.home);
      const b = teamKey(r.away);
      return (a === k1 && b === k2) || (a === k2 && b === k1);
    });
    setActiveNo(match ? match.no : null);
    setOpenNo(null);
    setRevealed(new Set());
  }, [run.nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!rows.length) return null;

  const ctx: SlotCtx = { byNo, activeNo, revealed, openNo, view, reveal, twoScores };

  return (
    <section className="card board" onClick={() => { setOpenNo(null); setMsg(""); }}>
      <div className="board-head">
        <span className={`tap-hint ${msg ? "lock-msg" : ""}`}>
          {msg || (view === "predicted" ? "Tap any match to reveal the winner" : "")}
        </span>
        <div className="seg" role="tablist" aria-label="Bracket view">
          <button role="tab" aria-selected={view === "predicted"} className={view === "predicted" ? "on" : ""} onClick={() => { setView("predicted"); setRevealed(new Set()); setOpenNo(null); setMsg(""); }}>Predicted</button>
          <button role="tab" aria-selected={view === "real"} className={view === "real" ? "on" : ""} onClick={() => { setView("real"); setRevealed(new Set()); setOpenNo(null); setMsg(""); }}>Real</button>
        </div>
      </div>
      <div className="bracket">
        <Col nos={LEFT.r32} label="Round of 32" ctx={ctx} />
        <Col nos={LEFT.r16} label="Round of 16" ctx={ctx} />
        <Col nos={LEFT.qf} label="Quarters" ctx={ctx} />
        <Col nos={LEFT.sf} label="Semis" ctx={ctx} />

        <div className="bcol bcol-final">
          <div className="bcol-head">Final</div>
          <div className="bcol-body"><Slot no={104} ctx={ctx} /></div>
        </div>

        <Col nos={RIGHT.sf} label="Semis" ctx={ctx} />
        <Col nos={RIGHT.qf} label="Quarters" ctx={ctx} />
        <Col nos={RIGHT.r16} label="Round of 16" ctx={ctx} />
        <Col nos={RIGHT.r32} label="Round of 32" ctx={ctx} />
      </div>

      <div className="champ-banner">
        {(() => {
          const fin = byNo[104];
          const finalReached = roundOpen(5); // Final unlocks once both semi-finals are played
          let cap = "Champion";
          let name = "";
          if (view === "real") {
            // Real view: only the actual champion, once the Final is played.
            if (fin?.played && fin.realWinner) { name = fin.realWinner; }
          } else if (finalReached) {
            // Predicted view: projected champion, but only once we've reached the Final.
            cap = "Model's projected champion";
            name = champion;
          }
          return (
            <div className={`champ ${name ? "lit" : "dim"}`}>
              <span className="champ-cap">{cap}</span>
              <span className="champ-name">
                {name ? <><Flag name={name} size={24} /> {name}</> : "— revealed after the Final —"}
              </span>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
