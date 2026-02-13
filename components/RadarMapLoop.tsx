"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type RainViewerAPI = {
  host: string;
  radar: {
    past: { time: number; path: string }[];
    nowcast?: { time: number; path: string }[];
  };
};

async function getRainViewer(): Promise<RainViewerAPI> {
  const r = await fetch("https://api.rainviewer.com/public/weather-maps.json", { cache: "no-store" });
  if (!r.ok) throw new Error("RainViewer API failed");
  return r.json();
}

function fmtTimeBR(ts: number) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(ts * 1000)
  );
}

export default function RadarMapLoop() {
  const [frames, setFrames] = useState<{ time: number; url: string }[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<number | null>(null);

  // BRASIL (bounding box aproximado)
  // left,top,right,bottom
  const bbox = useMemo(() => ({ left: -74, top: 6, right: -34, bottom: -34 }), []);

  useEffect(() => {
    getRainViewer()
      .then((d) => {
        const past = d.radar?.past ?? [];
        const last = past.slice(-12).map((f) => ({
          time: f.time,
          // render estático como imagem (sem leaflet)
          url: `${d.host}${f.path}/512.png?bbox=${bbox.left},${bbox.top},${bbox.right},${bbox.bottom}&color=2&smooth=1&snow=1`,
        }));
        setFrames(last);
        setIdx(Math.max(0, last.length - 1));
      })
      .catch(() => setFrames([]));
  }, [bbox]);

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    timer.current = window.setInterval(() => setIdx((v) => (v + 1) % frames.length), 700);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing, frames.length]);

  const label = frames.length ? fmtTimeBR(frames[idx].time) : "—";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 10,
        }}
      >
        <div style={{ opacity: 0.75, fontSize: 12 }}>Loop temporal: {label}</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn" onClick={() => setPlaying((p) => !p)}>
            {playing ? "Pausar" : "Play"}
          </button>

          <input
            type="range"
            min={0}
            max={Math.max(0, frames.length - 1)}
            value={idx}
            onChange={(e) => setIdx(Number(e.target.value))}
            style={{ width: 220 }}
          />
        </div>
      </div>

      <div
        style={{
          height: 520,
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,.12)",
          background: "rgba(255,255,255,.04)",
          position: "relative",
        }}
      >
        {/* base "mapa" simples (gradiente), evita dependências */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 30%, rgba(80,160,255,.20), rgba(0,0,0,0) 55%), linear-gradient(180deg, rgba(255,255,255,.05), rgba(0,0,0,0))",
          }}
        />

        {frames.length ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={frames[idx].url}
            alt="Radar chuva"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.92,
              filter: "contrast(1.05) saturate(1.05)",
            }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: 0.7 }}>
            Carregando radar…
          </div>
        )}

        <div style={{ position: "absolute", left: 12, bottom: 12, fontSize: 12, opacity: 0.7 }}>
          Fonte: RainViewer
        </div>
      </div>
    </div>
  );
}
