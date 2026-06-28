"use client";

import { useState, useEffect } from "react";
import { ROUND_ORDER, ParticipantState } from "@/lib/bracket-data";

export default function AdminPage() {
  const [participants, setParticipants] = useState<ParticipantState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/all-predictions")
      .then((r) => r.json())
      .then((data) => {
        setParticipants(data.participants || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Cargando...</div>;
  }

  return (
    <div style={{ fontFamily: "-apple-system, sans-serif", padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Panel admin — Quiniela APyRE</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>{participants.length} participantes registrados</p>

      {participants.map((p) => (
        <div key={p.name} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>{p.name}</h2>
          {ROUND_ORDER.map((round) => {
            const filled = round.matches.filter((m) => p.predictions[m.id]?.winner).length;
            return (
              <div key={round.meta.key} style={{ fontSize: 13, color: "#555", marginBottom: 2 }}>
                {round.meta.label}: {filled}/{round.matches.length} predicciones completadas
              </div>
            );
          })}
        </div>
      ))}

      {participants.length === 0 && (
        <p style={{ color: "#999" }}>Nadie ha registrado predicciones todavía.</p>
      )}
    </div>
  );
}
