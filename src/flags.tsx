/**
 * Real flag images (flagcdn) keyed by team name. Windows/Chrome does NOT render
 * emoji flags (regional-indicator pairs show as letters), so we use <img> SVGs
 * which render identically everywhere.
 */

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// team name (normalised) -> ISO 3166-1 alpha-2 (or flagcdn subdivision code)
const ISO: Record<string, string> = {
  mexico: "mx", southafrica: "za", southkorea: "kr", korearepublic: "kr",
  czechrepublic: "cz", czechia: "cz", switzerland: "ch", bosniaandherzegovina: "ba",
  canada: "ca", qatar: "qa", scotland: "gb-sct", morocco: "ma", brazil: "br", haiti: "ht",
  unitedstates: "us", usa: "us", australia: "au", turkey: "tr", turkiye: "tr", paraguay: "py",
  germany: "de", ivorycoast: "ci", cotedivoire: "ci", ecuador: "ec", curacao: "cw",
  netherlands: "nl", sweden: "se", tunisia: "tn", japan: "jp", belgium: "be", egypt: "eg",
  iran: "ir", iriran: "ir", newzealand: "nz", spain: "es", capeverde: "cv", caboverde: "cv",
  uruguay: "uy", saudiarabia: "sa", france: "fr", iraq: "iq", norway: "no", senegal: "sn",
  argentina: "ar", algeria: "dz", austria: "at", jordan: "jo", portugal: "pt", uzbekistan: "uz",
  colombia: "co", congodr: "cd", drcongo: "cd", england: "gb-eng", croatia: "hr",
  ghana: "gh", panama: "pa",
};

export function flagUrl(name: string): string | null {
  const code = ISO[norm(name)];
  return code ? `https://flagcdn.com/${code}.svg` : null;
}

/** Canonical key for a team, stable across name variants (Congo DR / DR Congo). */
export function teamKey(name: string): string {
  const n = norm(name);
  return ISO[n] ?? n;
}

export function Flag({ name, size = 18 }: { name: string; size?: number }) {
  const url = flagUrl(name);
  if (!url) return null;
  return <img className="flag" src={url} alt="" width={size} height={Math.round((size * 3) / 4)} loading="lazy" />;
}
