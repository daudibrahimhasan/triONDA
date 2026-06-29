import type { Meta } from "../types";

export default function About({ meta }: { meta: Meta }) {
  return (
    <div className="about">
      <p className="about-lede">
        <strong>TRIONDA</strong> is a from-scratch machine-learning system that predicts the{" "}
        <strong>winner</strong>, the <strong>scoreline</strong> and the <strong>goalscorers</strong>{" "}
        of every 2026 World Cup match — then validates itself blind against tournaments it never
        trained on.
      </p>

      <div className="about-stats-strip">
        <div><b>{meta.matches.toLocaleString()}</b><span>matches trained</span></div>
        <div><b>{meta.features}</b><span>features / match</span></div>
        <div><b>{meta.teams}</b><span>nations</span></div>
        <div><b>{meta.accuracy}</b><span>blind accuracy</span></div>
      </div>

      <div className="about-grid">
        <section className="about-card">
          <h3 className="about-h">How it works</h3>
          <p>
            Every match becomes a snapshot of point-in-time features — recent form, squad
            quality, playing style, head-to-head history and situational context. Several
            specialist models read that snapshot, a meta-learner blends their views, and a
            final layer adjusts for rivalry and host-city support.
          </p>
        </section>

        <section className="about-card">
          <h3 className="about-h">A panel of specialists</h3>
          <p>
            Rather than one model guessing everything, separate specialists handle the
            <strong> result</strong>, the <strong>scoreline</strong> and the
            <strong> goalscorers</strong>. Each is good at one job; combining them beats any
            single model on its own.
          </p>
        </section>

        <section className="about-card">
          <h3 className="about-h">Honest by design</h3>
          <p>
            Every prediction ships with a <strong>confidence</strong> score and a{" "}
            <strong>chaos coefficient</strong>. Flat, unpredictable matches are flagged as
            low-confidence rather than dressed up — the model never claims certainty it
            hasn't earned.
          </p>
        </section>

        <section className="about-card">
          <h3 className="about-h">It updates in real time</h3>
          <p>
            As kickoff nears, the prediction tightens with confirmed line-ups, late injuries
            and match-day weather. Unconfirmed line-ups are always flagged, and the call is
            locked shortly before kickoff.
          </p>
        </section>

        <section className="about-card">
          <h3 className="about-h">Free data only</h3>
          <p>
            No paid APIs and no betting odds. Results history, rankings, squad ratings and
            player stats all come from open sources — and nothing older than two years
            carries meaningful weight.
          </p>
        </section>

        <section className="about-card">
          <h3 className="about-h">Tested blind</h3>
          <ul className="about-stats">
            {meta.tested.map((t) => (
              <li key={t.label}>
                <span>{t.label}</span>
                <b>{t.value}</b>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="about-credit">
        <span className="about-credit-by">
          Built by{" "}
          <a href="https://www.linkedin.com/in/daudibrahimhasan" target="_blank" rel="noopener noreferrer">
            @daudibrahimhasan
          </a>
        </span>
        <span className="about-socials">
          <a href="https://www.linkedin.com/in/daudibrahimhasan" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.4 8.65 22 10.6 22 14v7h-4v-6.2c0-1.48-.03-3.38-2.06-3.38-2.06 0-2.38 1.6-2.38 3.27V21H9V9Z" /></svg>
          </a>
          <a href="https://github.com/daudibrahimhasan" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.9-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.36 9.36 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" /></svg>
          </a>
          <a href="mailto:daudibrahimhasan@gmail.com" aria-label="Email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6 8.5-6" /></svg>
          </a>
        </span>
      </footer>
    </div>
  );
}
