export interface TeamInfo {
  name: string;
  flag: string;
}

export type Scorer = [string, number]; // [player name, prob-to-score %]

export interface Pred {
  pa: number; // left team win %
  pd: number; // draw %
  pb: number; // right team win %
  s: string; // most-likely score "h-a" (oriented left-right)
  alt: string[]; // two more likely scorelines (oriented left-right)
  sa: Scorer[]; // left team scorers
  sb: Scorer[]; // right team scorers
  why: string; // one-line explanation of the outcome
}

export interface ModelInfo {
  name: string;
  job: string;
  how: string;
}

export interface TestedRow {
  label: string;
  value: string;
}

export interface Meta {
  accuracy: string;
  correct: number;
  total: number;
  matches: number;
  features: string;
  teams: number;
  champion: string;
  championFlag: string;
  tested: TestedRow[];
  models: ModelInfo[];
}

export interface BracketRow {
  no: number;
  round: string;
  home: string;
  away: string;
  homeFlag: string;
  awayFlag: string;
  score: string;
  winner: string;
  winnerFlag: string;
  played: boolean; // true = real result entered; false = model projection only
  why: string; // one-line explanation of the tie's outcome
  // score/winner above are always the MODEL'S PREDICTION; these hold the real
  // result, present only when played === true.
  realScore?: string;
  realWinner?: string;
  realWinnerFlag?: string;
}

export interface AwardWinner {
  player?: string;
  team: string;
  goals?: number;
  real_goals?: number;
  sim_goals?: number;
  clean_sheets?: number;
  age?: number;
  cards_per_match?: number;
}

export interface Sim {
  champion: string;
  goldenBoot: AwardWinner | null;
  goldenBall: AwardWinner | null;
  goldenGlove: AwardWinner | null;
  youngPlayer: AwardWinner | null;
  fairPlay: AwardWinner | null;
}

export interface Data {
  meta: Meta;
  teams: TeamInfo[];
  preds: Record<string, Pred>;
  bracket: BracketRow[];
  awards?: Sim[];
}
