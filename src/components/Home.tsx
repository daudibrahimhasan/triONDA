import type { Meta } from "../types";
import Hero from "./Hero";
import BlockNav from "./BlockNav";

type Panel = "awards" | "bracket" | "predict" | "about";

interface Props {
  meta: Meta;
  onOpen: (panel: Panel) => void;
  koCorrect: number;
  koTotal: number;
}

export default function Home({ meta, onOpen, koCorrect, koTotal }: Props) {
  return (
    <div className="home">
      <aside className="block-nav-wrap">
        <BlockNav onOpen={onOpen} />
      </aside>
      <main className="home-main">
        <Hero meta={meta} koCorrect={koCorrect} koTotal={koTotal} />
        <p className="foot-credit">
          <span>© 2026 TRIONDA</span>
          <span className="foot-dot">·</span>
          <span>
            Built by{" "}
            <a href="https://www.linkedin.com/in/daudibrahimhasan" target="_blank" rel="noopener noreferrer">
              @daudibrahimhasan
            </a>
          </span>
        </p>
      </main>
    </div>
  );
}
