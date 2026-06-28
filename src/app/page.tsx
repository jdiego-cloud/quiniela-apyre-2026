"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ROUND_ORDER,
  Round32Match,
  DependentMatch,
  MatchPrediction,
  ParticipantState,
} from "@/lib/bracket-data";

const TEAL = "#0191B6";
const TEAL_D = "#006E8A";
const TEAL_L = "#E6F6FB";
const YELLOW = "#F3AE2F";
const YELLOW_L = "#FFF3D6";
const GREY = "#4A5E6E";
const DARK = "#013040";
const MID = "#B8DDE8";
const GREEN = "#1A7A4A";
const GREEN_L = "#E8F5EE";

function isRound32(m: Round32Match | DependentMatch): m is Round32Match {
  return (m as Round32Match).local !== undefined;
}

export default function BracketPage() {
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [predictions, setPredictions] = useState<Record<string, MatchPrediction>>({});
  const [saveStatus, setSaveStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const getWinnerName = useCallback(
    (matchId: string): string | null => {
      const pred = predictions[matchId];
      if (!pred || !pred.winner) return null;
      const round = ROUND_ORDER.flatMap((r) => r.matches).find((m) => m.id === matchId);
      if (!round) return null;
      if (isRound32(round)) {
        return pred.winner === "local" ? round.local : round.visitante;
      } else {
        const [idA, idB] = round.from;
        const nameA = getWinnerName(idA);
        const nameB = getWinnerName(idB);
        return pred.winner === "local" ? nameA : nameB;
      }
    },
    [predictions]
  );

  const getTeamsForMatch = useCallback(
    (match: Round32Match | DependentMatch): { local: string | null; visit: string | null } => {
      if (isRound32(match)) {
        return { local: match.local, visit: match.visitante };
      }
      const [idA, idB] = match.from;
      return { local: getWinnerName(idA), visit: getWinnerName(idB) };
    },
    [getWinnerName]
  );

  const isMatchReady = useCallback(
    (match: Round32Match | DependentMatch): boolean => {
      if (isRound32(match)) return true;
      const [idA, idB] = match.from;
      return !!getWinnerName(idA) && !!getWinnerName(idB);
    },
    [getWinnerName]
  );

  async function loadParticipant(n: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/predictions/${encodeURIComponent(n)}`);
      const data = await res.json();
      if (data.found && data.state) {
        const state = data.state as ParticipantState;
        setName(state.name);
        setPredictions(state.predictions || {});
      } else {
        setName(n);
        setPredictions({});
      }
    } catch (e) {
      console.error(e);
      setName(n);
      setPredictions({});
    }
    setLoading(false);
  }

  async function saveParticipant(newPredictions: Record<string, MatchPrediction>) {
    if (!name) return;
    try {
      await fetch(`/api/predictions/${encodeURIComponent(name)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, predictions: newPredictions } as ParticipantState),
      });
    } catch (e) {
      console.error("save error", e);
    }
  }

  useEffect(() => {
    if (!name) return;
    const t = setTimeout(() => {
      saveParticipant(predictions);
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predictions, name]);

  function updateScore(matchId: string, field: "local" | "visit", value: string) {
    setPredictions((prev) => {
      const p: MatchPrediction = { ...(prev[matchId] || {}) };
      p[field] = value;
      const l = parseInt(p.local ?? "");
      const v = parseInt(p.visit ?? "");
      if (!isNaN(l) && !isNaN(v) && l !== v) {
        p.winner = l > v ? "local" : "visit";
        p.penaltyWinner = undefined;
      } else if (!isNaN(l) && !isNaN(v) && l === v) {
        p.winner = p.penaltyWinner;
      }
      return { ...prev, [matchId]: p };
    });
  }

  function selectPenaltyWinner(matchId: string, side: "local" | "visit") {
    setPredictions((prev) => {
      const p: MatchPrediction = { ...(prev[matchId] || {}) };
      p.penaltyWinner = side;
      p.winner = side;
      return { ...prev, [matchId]: p };
    });
  }

  function handleManualSave() {
    saveParticipant(predictions);
    setSaveStatus("✓ Guardado correctamente");
    setTimeout(() => setSaveStatus(""), 2500);
  }

  function teamLabel(n: string | null) {
    return n || "Por definir";
  }

  if (!name) {
    return (
      <div style={{ fontFamily: "-apple-system, sans-serif", background: TEAL_L, minHeight: "100vh", paddingBottom: 40 }}>
        <div style={{ background: "white", padding: "16px 20px 14px", textAlign: "center", borderBottom: `4px solid ${YELLOW}` }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: TEAL_D }}>APyRE</div>
          <div style={{ fontSize: 13, color: GREY, marginTop: 4 }}>Quiniela Mundialista 2026 — Eliminatoria</div>
        </div>
        <div style={{ background: TEAL, color: "white", textAlign: "center", padding: "22px 16px 26px" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", letterSpacing: 0.5 }}>BRACKET DE ELIMINACIÓN</h1>
          <p style={{ margin: "4px 0 0", color: YELLOW, fontSize: 14, fontStyle: "italic" }}>Predice toda la ruta hasta la final</p>
        </div>
        <div style={{ margin: 16, background: "white", borderRadius: 14, padding: 20, textAlign: "center", border: `2px solid ${YELLOW}` }}>
          <h2 style={{ color: TEAL_D, fontSize: 17, margin: "0 0 10px" }}>¿Cuál es tu nombre?</h2>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Nombre completo"
            style={{ width: "100%", padding: 12, fontSize: 16, borderRadius: 10, border: `2px solid ${MID}`, marginBottom: 10, textAlign: "center" }}
          />
          <button
            onClick={() => nameInput.trim() && loadParticipant(nameInput.trim())}
            disabled={loading}
            style={{ width: "100%", padding: 13, fontSize: 16, fontWeight: 700, borderRadius: 10, border: "none", background: YELLOW, color: DARK }}
          >
            {loading ? "Cargando..." : "Continuar"}
          </button>
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: GREY, margin: "18px 16px 0", lineHeight: 1.5 }}>
          Usa el mismo nombre que registraste en la fase de grupos.
          <br />
          Tus predicciones se guardan automáticamente en el servidor.
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "-apple-system, sans-serif", background: TEAL_L, minHeight: "100vh", paddingBottom: 40 }}>
      <div style={{ background: "white", padding: "16px 20px 14px", textAlign: "center", borderBottom: `4px solid ${YELLOW}`, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: TEAL_D }}>APyRE · {name}</div>
        <div style={{ fontSize: 13, color: GREY, marginTop: 4 }}>Quiniela Mundialista 2026 — Eliminatoria</div>
      </div>

      <div style={{ background: TEAL, color: "white", textAlign: "center", padding: "22px 16px 26px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", letterSpacing: 0.5 }}>BRACKET DE ELIMINACIÓN</h1>
        <p style={{ margin: "4px 0 0", color: YELLOW, fontSize: 14, fontStyle: "italic" }}>Elige quién avanza en cada partido</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 4, padding: "14px 16px 4px", background: "white", flexWrap: "wrap" }}>
        {ROUND_ORDER.map((round) => {
          const done = round.matches.every((m) => predictions[m.id]?.winner);
          const anyReady = round.matches.some((m) => isMatchReady(m));
          let bg = "#EEE", color = "#999";
          if (done) { bg = GREEN_L; color = GREEN; }
          else if (anyReady) { bg = TEAL; color = "white"; }
          else { bg = TEAL_L; color = TEAL_D; }
          return (
            <div key={round.meta.key} style={{ fontSize: 11, fontWeight: 700, padding: "6px 10px", borderRadius: 16, background: bg, color, whiteSpace: "nowrap" }}>
              {round.meta.label}
            </div>
          );
        })}
      </div>

      {ROUND_ORDER.map((round) => (
        <div key={round.meta.key} style={{ margin: "18px 16px 0" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: TEAL_D, textAlign: "center", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 }}>
            {round.meta.label}
          </div>
          <div style={{ fontSize: 12, color: GREY, textAlign: "center", marginBottom: 12 }}>
            {round.meta.mult}x puntos por partido{round.meta.key === "final" ? " (4x ganador)" : ""}
          </div>

          {round.matches.map((match) => {
            const ready = isMatchReady(match);
            const teams = ready ? getTeamsForMatch(match) : { local: null, visit: null };
            const pred = predictions[match.id] || {};
            const l = parseInt(pred.local ?? "");
            const v = parseInt(pred.visit ?? "");
            const isDraw = pred.local !== undefined && pred.visit !== undefined && pred.local !== "" && pred.visit !== "" && !isNaN(l) && !isNaN(v) && l === v;

            if (!ready) {
              return (
                <div key={match.id} style={{ background: "#F3F3F0", border: "1px dashed #BBB", borderRadius: 14, padding: 18, textAlign: "center", color: "#999", fontSize: 13, marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{match.date}</div>
                  Se desbloquea cuando elijas los ganadores de la ronda anterior
                </div>
              );
            }

            const localSel = pred.winner === "local";
            const visitSel = pred.winner === "visit";

            return (
              <div key={match.id} style={{ background: "white", borderRadius: 14, padding: 14, marginBottom: 12, border: `1px solid ${MID}` }}>
                <div style={{ fontSize: 11, color: GREY, textAlign: "center", marginBottom: 8, fontWeight: 600 }}>{match.date}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div
                    style={{
                      flex: 1, padding: "10px 6px", borderRadius: 10,
                      border: `2px solid ${localSel ? TEAL_D : MID}`,
                      background: localSel ? TEAL : TEAL_L,
                      color: localSel ? "white" : TEAL_D,
                      fontSize: 13, fontWeight: 700, textAlign: "center",
                      minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {teamLabel(teams.local)}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: YELLOW, background: DARK, width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    VS
                  </div>
                  <div
                    style={{
                      flex: 1, padding: "10px 6px", borderRadius: 10,
                      border: `2px solid ${visitSel ? TEAL_D : MID}`,
                      background: visitSel ? TEAL : TEAL_L,
                      color: visitSel ? "white" : TEAL_D,
                      fontSize: 13, fontWeight: 700, textAlign: "center",
                      minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {teamLabel(teams.visit)}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 8 }}>
                  <input
                    type="number" min={0} max={20}
                    value={pred.local ?? ""}
                    onChange={(e) => updateScore(match.id, "local", e.target.value)}
                    placeholder="0"
                    style={{ width: 50, textAlign: "center", fontSize: 18, fontWeight: 700, padding: 8, borderRadius: 8, border: `2px solid ${MID}` }}
                  />
                  <span style={{ fontSize: 18, fontWeight: 700, color: GREY }}>–</span>
                  <input
                    type="number" min={0} max={20}
                    value={pred.visit ?? ""}
                    onChange={(e) => updateScore(match.id, "visit", e.target.value)}
                    placeholder="0"
                    style={{ width: 50, textAlign: "center", fontSize: 18, fontWeight: 700, padding: 8, borderRadius: 8, border: `2px solid ${MID}` }}
                  />
                </div>
                <div style={{ fontSize: 11, color: GREY, textAlign: "center", marginTop: 4 }}>Marcador en tiempo regular (90 min)</div>

                {isDraw && (
                  <>
                    <div style={{ fontSize: 12, color: TEAL_D, textAlign: "center", marginTop: 8, fontWeight: 600, background: YELLOW_L, borderRadius: 8, padding: 6 }}>
                      Empate en tu predicción → ¿quién avanza en penales?
                    </div>
                    <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                      <button
                        onClick={() => selectPenaltyWinner(match.id, "local")}
                        style={{
                          flex: 1, padding: "8px 4px", borderRadius: 8,
                          border: `2px ${pred.penaltyWinner === "local" ? "solid" : "dashed"} ${YELLOW}`,
                          background: pred.penaltyWinner === "local" ? YELLOW : YELLOW_L,
                          fontSize: 12, fontWeight: 700, color: DARK, cursor: "pointer",
                        }}
                      >
                        {teamLabel(teams.local)}
                      </button>
                      <button
                        onClick={() => selectPenaltyWinner(match.id, "visit")}
                        style={{
                          flex: 1, padding: "8px 4px", borderRadius: 8,
                          border: `2px ${pred.penaltyWinner === "visit" ? "solid" : "dashed"} ${YELLOW}`,
                          background: pred.penaltyWinner === "visit" ? YELLOW : YELLOW_L,
                          fontSize: 12, fontWeight: 700, color: DARK, cursor: "pointer",
                        }}
                      >
                        {teamLabel(teams.visit)}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <div style={{ background: "linear-gradient(135deg, #FFF3D6, white)", border: `2px solid ${YELLOW}`, borderRadius: 16, padding: 20, textAlign: "center", margin: "18px 16px" }}>
        <div style={{ fontSize: 32 }}>🏆</div>
        <h3 style={{ color: TEAL_D, fontSize: 16, margin: "6px 0 12px" }}>
          Recuerda: tus predicciones de Máximo Goleador, Balón de Oro y Guante de Oro
          <br />
          ya quedaron registradas en el Form 1
        </h3>
      </div>

      <div style={{ position: "sticky", bottom: 0, background: "white", padding: "12px 16px", boxShadow: "0 -2px 10px rgba(0,0,0,0.08)", marginTop: 20 }}>
        <button
          onClick={handleManualSave}
          style={{ width: "100%", padding: 14, fontSize: 16, fontWeight: 800, borderRadius: 12, border: "none", background: GREEN, color: "white" }}
        >
          Guardar mis predicciones
        </button>
        <div style={{ textAlign: "center", fontSize: 12, color: GREEN, marginTop: 6, minHeight: 16 }}>{saveStatus}</div>
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: GREY, margin: "18px 16px 0", lineHeight: 1.5 }}>
        Puedes cerrar esta página y volver después — tus selecciones se guardan automáticamente.
        <br />
        Cada ronda se desbloquea conforme avanza el torneo.
      </div>
    </div>
  );
}
