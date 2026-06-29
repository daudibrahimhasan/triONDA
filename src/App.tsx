import { useCallback, useEffect, useMemo, useState } from "react";
import type { Data } from "./types";
import Home from "./components/Home";
import Awards from "./components/Awards";
import Bracket from "./components/Bracket";
import Predictor from "./components/Predictor";
import About from "./components/About";
import Overlay from "./components/Overlay";
import { teamKey } from "./flags";

type Panel = "awards" | "bracket" | "predict" | "about";

export default function App() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);
  const [lastRun, setLastRun] = useState({ home: "", away: "", nonce: 0 });
  const [active, setActive] = useState<Panel | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Data>;
      })
      .then((d) => {
        if (!d || !Array.isArray(d.bracket) || !Array.isArray(d.teams)) {
          throw new Error("malformed data.json");
        }
        setData(d);
      })
      .catch(() => setError(true));
  }, []);

  // Derive the knockout teams / opponents / live KO accuracy once per data load.
  const derived = useMemo(() => {
    if (!data) return null;
    const koKeys = new Set(
      data.bracket
        .filter((r) => r.round === "Round of 32")
        .flatMap((r) => [teamKey(r.home), teamKey(r.away)])
    );
    const koTeams = data.teams.filter((t) => koKeys.has(teamKey(t.name)));
    const koByKey = new Map(koTeams.map((t) => [teamKey(t.name), t.name]));
    const opponents: Record<string, string> = {};
    data.bracket
      .filter((r) => r.round === "Round of 32")
      .forEach((r) => {
        const h = koByKey.get(teamKey(r.home));
        const a = koByKey.get(teamKey(r.away));
        if (h && a) {
          opponents[h] = a;
          opponents[a] = h;
        }
      });
    const koPlayed = data.bracket.filter((r) => r.played);
    const koCorrect = koPlayed.filter((r) => r.realWinner === r.winner).length;
    return { koTeams, opponents, koCorrect, koTotal: koPlayed.length };
  }, [data]);

  // Stable handler identities so Overlay's effects don't re-subscribe each render.
  const closeOverlay = useCallback(() => setActive(null), []);
  const handleRun = useCallback(
    (home: string, away: string) => setLastRun((s) => ({ home, away, nonce: s.nonce + 1 })),
    []
  );

  if (error) {
    return (
      <div className="loading">
        Could not load predictions. Run <code>python export_frontend_data.py</code> first.
      </div>
    );
  }
  if (!data || !derived) {
    return <div className="loading">Loading the model's predictions…</div>;
  }

  const { koTeams, opponents, koCorrect, koTotal } = derived;

  return (
    <div className="page">
      <div className="pitch" aria-hidden />
      <Home meta={data.meta} onOpen={setActive} koCorrect={koCorrect} koTotal={koTotal} />
      <Overlay open={active === "awards"} title="Awards" accent="var(--lime)" onClose={closeOverlay}>
        <Awards sims={data.awards} />
      </Overlay>
      <Overlay open={active === "bracket"} title="Bracket" accent="var(--violet)" onClose={closeOverlay}>
        <Bracket rows={data.bracket} champion={data.meta.champion} run={lastRun} preds={data.preds} />
      </Overlay>
      <Overlay open={active === "predict"} title="Run a Prediction" accent="var(--wc-green)" onClose={closeOverlay}>
        <Predictor
          teams={koTeams}
          preds={data.preds}
          meta={data.meta}
          opponents={opponents}
          onRun={handleRun}
        />
      </Overlay>
      <Overlay open={active === "about"} title="About" accent="var(--red)" credit={false} onClose={closeOverlay}>
        <About meta={data.meta} />
      </Overlay>
    </div>
  );
}
