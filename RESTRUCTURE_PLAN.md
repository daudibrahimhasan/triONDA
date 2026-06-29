# Frontend Restructure Plan — "Launcher Home + Overlays"

**Goal:** Convert the current long, single scrolling page into a **fixed, non-scrollable home screen** that acts as a launcher. The home keeps the hero. On the **left**, three clickable **blocks** open their content as **full-screen overlay panels** on top of the home.

**Implementer:** Claude Sonnet. **Planner:** Opus.
**Stack:** React 18 + TypeScript + Vite (no router, no extra deps needed).

---

## Decisions (locked)

1. **Overlay style:** Full-screen panel that fades/slides in over the home. Content scrolls **inside** the panel (important — the Bracket is tall). Close via ✕ button, `Esc` key, and backdrop click.
2. **Awards** becomes its own block — it is **removed from inside the Hero** and shown only in its overlay.
3. **Three blocks (top → bottom on the left):** `Awards` · `Bracket` · `Run Prediction`.
4. **Home is one viewport, no page scroll** (`100vh`, `overflow: hidden`).

---

## Current structure (for reference)

`src/App.tsx` renders a single column inside `.wrap`:
```
Hero (contains <Awards/>)  →  Reveal>Predictor (contains <RunConsole/>)  →  Reveal>Bracket  →  validation footer
```
- `App` already lifts the shared `lastRun` state (`{home, away, nonce}`) — set by `Predictor.onRun`, consumed by `Bracket`. **Keep this lifted in App** so running a prediction in one overlay updates the Bracket in another.
- `App` computes `koTeams`, `opponents`, `koKeys` from `data` — keep these in App and pass into the relevant overlay.
- Components already exist and are reused as-is: `Awards.tsx`, `Bracket.tsx`, `Predictor.tsx` (wraps `RunConsole.tsx`).

---

## Target structure

```
App
├─ <Home>                         // fixed, non-scrollable
│   ├─ hero content (title, kicker, lede, scoreboard, models)  // from Hero, minus <Awards/>
│   └─ <BlockNav> (left)          // 3 tiles: Awards / Bracket / Run Prediction
│       each tile -> setActive("awards" | "bracket" | "predict")
└─ <Overlay active=...>           // renders nothing when active === null
    ├─ awards  -> <Awards sims={data.awards} />
    ├─ bracket -> <Bracket rows champion run={lastRun} />
    └─ predict -> <Predictor teams preds meta opponents onRun={...} />
```

### New state in `App.tsx`
```ts
const [active, setActive] = useState<null | "awards" | "bracket" | "predict">(null);
```
Keep existing `lastRun` state and the `koTeams` / `opponents` derivations.

Optional nicety: when a prediction is run inside the Predict overlay, after `setLastRun(...)` you may auto-switch to the Bracket overlay (`setActive("bracket")`) so the user sees the result. **Confirm with user before adding** — otherwise leave the user on the Predict panel.

---

## Files to create

### 1. `src/components/Home.tsx`
- Renders the hero content (move the JSX currently in `Hero.tsx`'s `<header className="hero">` here, **except** `<Awards/>`).
- Renders `<BlockNav onOpen={setActive} />` positioned on the left.
- Renders the validation footer (`foot-validated`) currently in App — or keep it small at the bottom of the home; it must fit in one viewport (consider shrinking).
- Layout: CSS grid/flex with a fixed viewport. Left column = the three blocks; the hero sits center/right. On narrow screens, blocks stack above/below the hero (still no page scroll if it fits; otherwise allow the **home** to scroll only on small screens — acceptable fallback).

### 2. `src/components/BlockNav.tsx`
- Three `<button className="block block-awards|block-bracket|block-predict">` tiles.
- Each: an icon/eyebrow label + title + one-line subtitle, styled in the existing "chalk scoreboard" language (reuse tokens in `styles.css`: `--turf`, `--touchline`, `--violet`, `--shadow`, `--radius`).
- `onClick={() => onOpen(key)}`. Keyboard accessible (native buttons already are).

### 3. `src/components/Overlay.tsx`
- Props: `{ open: boolean; title: string; onClose: () => void; children }`.
- Renders `null` when `!open`.
- Structure: a fixed full-viewport `.overlay` backdrop + an `.overlay-panel` that fades/slides in; panel has a sticky header (title + ✕) and a scrollable body (`overflow-y: auto`).
- Behavior:
  - `Esc` closes (window keydown listener in `useEffect`, cleaned up on unmount).
  - Backdrop click closes; clicks inside the panel do not (`stopPropagation`).
  - Lock background scroll while open: set `document.body.style.overflow = "hidden"` on open, restore on close (home is already non-scroll, but this is correct hygiene).
  - Basic focus management: focus the ✕ button on open; restore focus to the triggering block on close (nice-to-have).
  - `role="dialog"`, `aria-modal="true"`, `aria-label={title}`.

---

## Files to edit

### `src/App.tsx`
- Add `active` state.
- Replace the stacked `Hero / Reveal>Predictor / Reveal>Bracket / footer` body with:
  ```tsx
  <div className="page">
    <div className="pitch" aria-hidden />
    <Home meta={data.meta} sims={data.awards} onOpen={setActive} tested={data.meta.tested} />
    <Overlay open={active === "awards"}  title="Awards"         onClose={() => setActive(null)}>
      <Awards sims={data.awards} />
    </Overlay>
    <Overlay open={active === "bracket"} title="Bracket"        onClose={() => setActive(null)}>
      <Bracket rows={data.bracket} champion={data.meta.champion} run={lastRun} />
    </Overlay>
    <Overlay open={active === "predict"} title="Run a Prediction" onClose={() => setActive(null)}>
      <Predictor teams={koTeams} preds={data.preds} meta={data.meta} opponents={opponents}
                 onRun={(home, away) => setLastRun(s => ({ home, away, nonce: s.nonce + 1 }))} />
    </Overlay>
  </div>
  ```
- Keep loading/error states unchanged.
- `Reveal` is no longer needed for these sections (overlays animate via Overlay's own transition). Leave `Reveal.tsx` in place (unused) or delete its imports here.

### `src/components/Hero.tsx`
- Either: **delete** and fold its JSX into `Home.tsx`, **or** keep `Hero` as a pure presentational piece used by `Home` but **remove the `<Awards/>` line (line 52)** and its `sims` usage.
- Recommended: keep `Hero` as the hero visual, drop Awards; `Home` composes `<Hero/>` + `<BlockNav/>` + footer.

### `src/styles.css`
- Set home to one viewport: a `.home` container with `height: 100vh; overflow: hidden;` (and reduce hero vertical paddings so it fits). The global `body` currently isn't scroll-locked — lock it only when an overlay is open (handled in JS), and ensure `.home` itself doesn't overflow.
- Add styles for `.block` tiles, `.block-nav` (left column), `.overlay`, `.overlay-panel`, `.overlay-head`, `.overlay-body`, `.overlay-close`.
- Overlay transition: backdrop `opacity`, panel `transform: translateY(8px)→0` + `opacity`, ~220ms ease. Respect `prefers-reduced-motion`.
- Reuse existing tokens; do not introduce a new palette.

---

## Layout sketch (home)

```
┌───────────────────────────────────────────────┐  ← 100vh, no scroll
│  ▌Awards▐                                       │
│  ▌      ▐        World Cup 2026                  │
│  ▌Bracket▐      Machine-Learning Predictor       │
│  ▌      ▐        [ scoreboard ]  [ 3 models ]     │
│  ▌Predict▐                                       │
│  (left blocks)        (hero, centered)           │
│           validated blind on … (small footer)    │
└───────────────────────────────────────────────┘
```
Click a left block → full-screen overlay fades in with that section; ✕ / Esc / backdrop returns to home.

---

## Acceptance checklist

- [ ] Home is exactly one viewport tall on desktop — no page scrollbar.
- [ ] Three left blocks: Awards, Bracket, Run Prediction; each opens its overlay.
- [ ] Overlay is full-screen, content scrolls inside, closes via ✕ / Esc / backdrop.
- [ ] Awards no longer appears inside the hero.
- [ ] Running a prediction in the Predict overlay still updates the Bracket overlay (shared `lastRun`).
- [ ] No new runtime dependencies added.
- [ ] `npm run build` (tsc + vite) passes clean.
- [ ] Reasonable mobile behavior (blocks stack; overlays full-screen).

## Out of scope
- No changes to data loading, `export_frontend_data.py`, or the prediction model.
- No routing/URL state (could be a later enhancement: deep-link `#bracket`).
