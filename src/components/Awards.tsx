import type { AwardWinner, Sim } from "../types";
import { Flag } from "../flags";

type AwardKey = keyof Omit<Sim, "champion">;

const AWARDS: {
  name: string; desc: string; color: string;
  key: AwardKey;
  id: (w: AwardWinner) => string;   // identity to group candidates by
  score: (w: AwardWinner) => number; // higher = ranks better
  stat: (w: AwardWinner) => string;  // line shown next to the candidate
}[] = [
  { name: "Golden Boot", desc: "Top goalscorer", color: "var(--trophy)", key: "goldenBoot",
    id: (w) => w.player ?? w.team, score: (w) => w.goals ?? 0, stat: (w) => `${w.goals} goals` },
  { name: "Golden Ball", desc: "Best overall player", color: "var(--violet)", key: "goldenBall",
    id: (w) => w.player ?? w.team, score: (w) => w.goals ?? 0, stat: (w) => `${w.goals} goals` },
  { name: "Golden Glove", desc: "Best goalkeeper", color: "var(--wc-green)", key: "goldenGlove",
    id: (w) => w.player ?? w.team, score: (w) => w.clean_sheets ?? 0, stat: (w) => `${w.clean_sheets} clean sheets` },
  { name: "Young Player", desc: "Best player under 21", color: "var(--lime)", key: "youngPlayer",
    id: (w) => w.player ?? w.team, score: (w) => -(w.age ?? 99), stat: (w) => `age ${w.age}` },
  { name: "Fair Play", desc: "Cleanest disciplinary record", color: "var(--red)", key: "fairPlay",
    id: (w) => w.team, score: (w) => -(w.cards_per_match ?? 99), stat: (w) => `${w.cards_per_match} cards / match` },
];

interface Ranked { w: AwardWinner; count: number; score: number }

/** Roll the per-simulation winners up into a ranked top-3 of candidates. */
function topThree(sims: Sim[], a: typeof AWARDS[number]): Ranked[] {
  const map = new Map<string, Ranked>();
  for (const sim of sims) {
    const w = sim[a.key];
    if (!w) continue;
    const key = a.id(w);
    const cur = map.get(key);
    const sc = a.score(w);
    if (!cur) map.set(key, { w, count: 1, score: sc });
    else { cur.count++; if (sc > cur.score) { cur.score = sc; cur.w = w; } }
  }
  return [...map.values()]
    .sort((x, y) => y.count - x.count || y.score - x.score)
    .slice(0, 3);
}

/** Most-projected champion across the simulation runs. */
function topChampion(sims: Sim[]): { team: string; count: number } | null {
  const map = new Map<string, number>();
  for (const s of sims) if (s.champion) map.set(s.champion, (map.get(s.champion) ?? 0) + 1);
  const best = [...map.entries()].sort((a, b) => b[1] - a[1])[0];
  return best ? { team: best[0], count: best[1] } : null;
}

export default function Awards({ sims }: { sims?: Sim[] }) {
  const runs = sims && sims.length ? sims : [];
  const has = runs.length > 0;
  const champ = has ? topChampion(runs) : null;

  return (
    <div className="awards">
      <div className="awards-inner">
        <header className="awards-header">
          <h2 className="awards-title">Projected Awards</h2>
          <p className="awards-note">
            {has
              ? <>Most-projected winners across <em>{runs.length}</em> Monte-Carlo runs of the knockout stage — candidates, not standings.</>
              : "Award projections will appear once the simulations have run."}
          </p>
        </header>

        {champ && (
          <div className="awards-champ">
            <span className="awards-champ-cap">🏆 Projected champion</span>
            <span className="awards-champ-team"><Flag name={champ.team} size={26} /> {champ.team}</span>
            <span className="awards-champ-sub">most frequent winner across the model's simulations</span>
          </div>
        )}

        <div className="award-grid">
          {AWARDS.map((a) => {
            const top = has ? topThree(sims!, a) : [];
            return (
              <div className="award-card" style={{ borderTopColor: a.color } as React.CSSProperties} key={a.name}>
                <div className="award-card-head">
                  <span className="award-name">{a.name}</span>
                  <span className="award-desc">{a.desc}</span>
                </div>
                <ol className="award-top3">
                  {top.map((r, i) => (
                    <li className={`aw-row ${i === 0 ? "lead" : ""}`} key={a.id(r.w)}>
                      <span className="aw-rank" style={{ color: a.color } as React.CSSProperties}>{i + 1}</span>
                      <span className="aw-who">
                        {r.w.player && <span className="aw-player">{r.w.player}</span>}
                        <span className="aw-team"><Flag name={r.w.team} size={12} /> {r.w.team}</span>
                      </span>
                      <span className="aw-meta">
                        <span className="aw-stat">{a.stat(r.w)}</span>
                        <span className="aw-count">{r.count}× of {runs.length}</span>
                      </span>
                    </li>
                  ))}
                  {top.length === 0 && <li className="aw-row aw-empty">—</li>}
                </ol>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
