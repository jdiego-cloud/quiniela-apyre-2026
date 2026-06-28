export interface Round32Match {
  id: string;
  date: string;
  local: string;
  visitante: string;
}

export interface DependentMatch {
  id: string;
  date: string;
  from: [string, string];
  useLoser?: boolean;
}

export interface RoundMeta {
  key: string;
  label: string;
  mult: number;
}

export const ROUND32: Round32Match[] = [
  { id: "m73", date: "28 jun · LA", local: "Sudáfrica", visitante: "Canadá" },
  { id: "m76", date: "29 jun · Houston", local: "Brasil", visitante: "Japón" },
  { id: "m74", date: "29 jun · Boston", local: "Alemania", visitante: "Paraguay" },
  { id: "m75", date: "30 jun · Monterrey", local: "Países Bajos", visitante: "Marruecos" },
  { id: "m78", date: "30 jun · Dallas", local: "Costa de Marfil", visitante: "Noruega" },
  { id: "m77", date: "30 jun · NY/NJ", local: "Francia", visitante: "Suecia" },
  { id: "m79", date: "01 jul · CDMX", local: "México", visitante: "Ecuador" },
  { id: "m80", date: "01 jul · Atlanta", local: "Inglaterra", visitante: "DR Congo" },
  { id: "m82", date: "01 jul · Seattle", local: "Bélgica", visitante: "Senegal" },
  { id: "m81", date: "02 jul · SF Bay", local: "Estados Unidos", visitante: "Bosnia" },
  { id: "m84", date: "02 jul · LA", local: "España", visitante: "Austria" },
  { id: "m83", date: "03 jul · Toronto", local: "Portugal", visitante: "Croacia" },
  { id: "m85", date: "03 jul · Vancouver", local: "Suiza", visitante: "Argelia" },
  { id: "m88", date: "03 jul · Dallas", local: "Australia", visitante: "Egipto" },
  { id: "m86", date: "03 jul · Miami", local: "Argentina", visitante: "Cabo Verde" },
  { id: "m87", date: "04 jul · KC", local: "Colombia", visitante: "Ghana" },
];

export const ROUND16: DependentMatch[] = [
  { id: "m89", date: "09 jul", from: ["m74", "m77"] },
  { id: "m90", date: "04 jul", from: ["m73", "m75"] },
  { id: "m91", date: "05 jul", from: ["m76", "m78"] },
  { id: "m92", date: "05/06 jul", from: ["m79", "m80"] },
  { id: "m93", date: "06 jul", from: ["m83", "m84"] },
  { id: "m94", date: "06 jul", from: ["m81", "m82"] },
  { id: "m95", date: "07 jul", from: ["m86", "m88"] },
  { id: "m96", date: "07 jul", from: ["m85", "m87"] },
];

export const QUARTERS: DependentMatch[] = [
  { id: "m97", date: "09 jul", from: ["m89", "m90"] },
  { id: "m98", date: "10 jul", from: ["m93", "m94"] },
  { id: "m99", date: "11 jul", from: ["m91", "m92"] },
  { id: "m100", date: "11 jul", from: ["m95", "m96"] },
];

export const SEMIS: DependentMatch[] = [
  { id: "m101", date: "14 jul", from: ["m97", "m98"] },
  { id: "m102", date: "15 jul", from: ["m99", "m100"] },
];

export const THIRD: DependentMatch = { id: "m3rd", date: "18 jul", from: ["m101", "m102"], useLoser: true };
export const FINAL: DependentMatch = { id: "final", date: "19 jul", from: ["m101", "m102"] };

export const ROUND_ORDER: { meta: RoundMeta; matches: (Round32Match | DependentMatch)[] }[] = [
  { meta: { key: "r32", label: "32avos", mult: 1 }, matches: ROUND32 },
  { meta: { key: "r16", label: "16avos", mult: 2 }, matches: ROUND16 },
  { meta: { key: "qf", label: "Cuartos", mult: 2 }, matches: QUARTERS },
  { meta: { key: "sf", label: "Semis", mult: 2 }, matches: SEMIS },
  { meta: { key: "third", label: "3er lugar", mult: 2 }, matches: [THIRD] },
  { meta: { key: "final", label: "Final", mult: 4 }, matches: [FINAL] },
];

export interface MatchPrediction {
  local?: string;
  visit?: string;
  winner?: "local" | "visit";
  penaltyWinner?: "local" | "visit";
}

export interface ParticipantState {
  name: string;
  predictions: Record<string, MatchPrediction>;
  updatedAt?: number;
}
