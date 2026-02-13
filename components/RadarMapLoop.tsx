"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import { useEffect, useMemo, useRef, useState } from "react";

type RainViewerAPI = {
  host: string;
  radar: { past: { time: number; path: string }[]; nowcast: { time: number; path: string }[] };
};

async function getRainViewer(): Promise<RainViewerAPI> {
  const r = await fetch("https://api.rainviewer.com/public/weather-maps.json", { cache: "no-store" });
  if (!r.ok) throw new Error("RainViewer API failed");
  return r.json();
}

export default function RadarMapLoop() {
  const [frames, setFrames] = useState<{ time: number; url: string }[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    getRainViewer()
      .then((d) => {
        const past = d.radar?.past ?? [];
        const last = past
          .slice(-12)
          .map((f) => ({ time: f.time, url: `${d.host}${f.path}/256/{z}/{x}/{y}/2/1_1.png` }));
        setFrames(last);
        setIdx(Math.max(0, last.length - 1));
      })
      .catch(() => setFrames([]));
  }, []);

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    timer.current = window.setInterval(() => setIdx((v) => (v + 1) % frames.length), 700);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [playing, frames.length]);

  const label = useMemo(() => {
    if (!frames.length) return "—";
    const dt = new Date(frames[idx].time * 1000);
    return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(dt);
  }, [frames, idx]);

  const center: [number, number] = [-23.5505, -46.6333];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", gap:12, alignItems:"center", flexWrap:"wrap", marginBottom:10 }}>
        <div style={{ opacity:.75, fontSize:12 }}>Loop temporal: {label}</div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button className="btn" onClick={() => setPlaying((p) => !p)}>{playing ? "Pausar" : "Play"}</button>
          <input
            type="range"
            min={0}
            max={Math.max(0, frames.length - 1)}
            value={idx}
            onChange={(e) => setIdx(Number(e.target.value))}
            style={{ width: 200 }}
          />
        </div>
      </div>

      <div style={{ height: 520, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.12)" }}>
        <MapContainer center={center} zoom={7} style={{ height: "100%", width: "100%" }}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Mapa (OSM)">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            </LayersControl.BaseLayer>

            <LayersControl.Overlay checked name="Radar (loop)">
              {frames.length ? <TileLayer url={frames[idx].url} opacity={0.58} /> : null}
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
      </div>
    </div>
  );
}
