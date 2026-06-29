import type { Meta } from "../types";
import { useCountUp } from "../hooks";

interface Props { meta: Meta; koCorrect?: number; koTotal?: number; }

export default function Hero({ meta, koCorrect = 0, koTotal = 0 }: Props) {
  const acc = useCountUp(parseFloat(meta.accuracy) || 0);
  const matches = useCountUp(meta.matches);
  // Live KO accuracy once real matches are played; until then fall back to the
  // blind-validated knockout figure from the test set.
  const koTested = meta.tested.find((t) => /knock/i.test(t.label));
  const koLive = koTotal > 0;
  const koPctTarget = koLive
    ? Math.round((koCorrect / koTotal) * 100)
    : parseFloat(koTested?.value ?? "0") || 0;
  const koPct = useCountUp(koPctTarget);

  return (
    <header className="hero">
      <div className="hero-inner">
        <p className="eyebrow">Model · Blind · Point-in-time</p>
        <h1 className="wordmark">
          TRI<span className="year">ONDA</span>
        </h1>
        <p className="kicker">World Cup 2026 · Machine-Learning Match Predictor</p>
        <p className="lede">
          A model that predicts the <strong>winner</strong>, the <strong>scoreline</strong> and the{" "}
          <strong>goalscorers</strong> for every match — built from scratch, tested blind. No paid
          data. No betting odds.
        </p>

        {/* Scoreboard: the headline stat read like a stadium board */}
        <div className="scoreboard">
          <div className="sb-side">
            <span className="sb-cap">Blind accuracy</span>
            <span className="sb-num">
              {acc.toFixed(1)}<span className="sb-pct">%</span>
            </span>
            <span className="sb-sub">{meta.correct} / {meta.total} correct · group stage</span>
          </div>
          <div className="sb-divider" />
          <div className="sb-meta">
            <div className="sb-row"><span>{Math.round(matches).toLocaleString()}</span><label>matches trained</label></div>
            <div className="sb-row"><span>{meta.features}</span><label>features / match</label></div>
            <div className="sb-row"><span>{meta.teams}</span><label>nations</label></div>
          </div>
          <div className="sb-divider" />
          <div className="sb-side sb-ko">
            <span className="sb-cap">KO accuracy</span>
            <span className="sb-num">
              {koPct.toFixed(koLive ? 0 : 1)}<span className="sb-pct">%</span>
            </span>
            <span className="sb-sub">
              {koLive ? `${koCorrect} / ${koTotal} correct · knockout` : "blind validation · knockout"}
            </span>
          </div>
        </div>
      </div>

      {/* Models — three specialists, not a sequence, so labelled not numbered */}
      <div className="models">
        {meta.models.map((m) => (
          <div className={`model model-${m.name.toLowerCase()}`} key={m.name}>
            <span className="model-job">{m.job}</span>
            <span className="model-name">{m.name}</span>
            <p className="model-how">{m.how}</p>
          </div>
        ))}
      </div>

    </header>
  );
}
