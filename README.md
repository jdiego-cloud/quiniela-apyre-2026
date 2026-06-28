# Quiniela Mundialista APyRE 2026 — Bracket de eliminatoria

App web para que los participantes de la quiniela predigan el bracket
completo de eliminación del Mundial 2026, partido a partido, con las
rondas futuras desbloqueándose automáticamente según sus selecciones.

## Stack
- Next.js (App Router) + TypeScript
- Upstash Redis (vía Vercel Marketplace) para guardar las predicciones de cada participante

## Cómo desplegar (ver GUIA_DESPLIEGUE.md para el paso a paso completo)

1. Sube esta carpeta a un repo de GitHub
2. Importa el repo en Vercel
3. En el proyecto de Vercel, ve a Storage → Marketplace → instala "Upstash Redis"
4. Despliega

## Estructura
- `src/lib/bracket-data.ts` — toda la estructura del bracket (Round of 32 confirmado + rondas dependientes)
- `src/app/page.tsx` — pantalla principal que ve cada participante
- `src/app/admin/page.tsx` — panel simple para ver el avance de todos los participantes
- `src/app/api/predictions/[name]/route.ts` — guarda/lee las predicciones de un participante
- `src/app/api/all-predictions/route.ts` — lista todas las predicciones (para el admin)
