"use client";

import { useEffect, useMemo, useState } from "react";
import WeatherCanvas from "../components/WeatherCanvas";
import TempChart from "../components/TempChart";
import { apiJson, ForecastBundle, emojiFromCondition } from "../lib/client";

function fmtDay(dateISO: string) {
  const d = new Date(dateISO);
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(d).toUpperCase();
}
function fmtHour(dateISO: string) {
  const d = new Date(dateISO);
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit" }).format(d);
}

function kpi(label: string, value: string) {
  return (
    <div className="kpi">
      <b>{label}</b>
      <span>{value}</span>
    </div>
  );
}

export default function HomePage() {
  const [city, setCity] = useState("São Paulo");
  const [data, setData] = useState<ForecastBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load(c: string) {
    setLoading(true);
    setErr(null);
    try {
      const res = await apiJson<ForecastBundle>(`/api/weather?city=${encodeURIComponent(c)}`);
      setData(res);
    } catch (e: any) {
      setErr("Não consegui buscar a previsão. Tente outra cidade.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(city); }, []);

  const hourlyTemps = useMemo(() => (data?.hourly ?? []).map((h) => h.tempC), [data]);
  const conditionEmoji = emojiFromCondition(data?.current?.conditionId ?? 800);

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">WeatherIA</div>
        <div className="pill">
          <a className="btn" href="/radar">Radar</a>
          <a className="btn" href="/push">Alertas</a>
        </div>
      </div>

      {/* HERO */}
      <div className="card cardHero">
        <WeatherCanvas conditionId={data?.current?.conditionId} />
        <div className="heroShade" />
        <div className="cardInner">
          <div className="small">Buscar cidade</div>
          <div className="row">
            <input
              className="input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: São Paulo"
            />
            <button className="btn" onClick={() => load(city)}>Buscar</button>
          </div>

          <div style={{ height: 14 }} />

          {loading && <div className="toast">Carregando previsão…</div>}
          {err && <div className="toast">{err}</div>}

          {!loading && data && (
            <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 260px" }}>
                <div style={{ fontSize: 20, fontWeight: 950 }}>{data.city}</div>
                <div className="muted">{data.current.description ?? "—"}</div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div className="icon" style={{ fontSize: 22 }}>{conditionEmoji}</div>
                <div className="bigTemp">{Math.round(data.current.tempC)}°</div>
                <div className="small">
                  Sensação {Math.round(data.current.feelsLikeC ?? data.current.tempC)}°
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 12 }} />

      {/* GRID */}
      {!loading && data && (
        <div className="grid">
          {/* LEFT */}
          <div className="col" style={{ gap: 12 }}>
            {/* KPIs */}
            <div className="card">
              <div className="h2">Agora</div>
              <div className="kpiRow">
                {kpi("Sensação", `${Math.round(data.current.feelsLikeC ?? data.current.tempC)}°`)}
                {kpi("Umidade", `${Math.round(data.current.humidity ?? 0)}%`)}
                {kpi("Vento", `${(data.current.windMs ?? 0).toFixed(1)} m/s`)}
                {kpi("Pressão", `${Math.round(data.current.pressure ?? 0)} hPa`)}
              </div>
              <div className="footerNote">
                Dica: ative alertas em <b>/push</b> para notificações (chuva/temporais).
              </div>
            </div>

            {/* Hourly */}
            <div className="card">
              <div className="h2">Próximas horas</div>
              <div className="hourly">
                {data.hourly.map((h, idx) => (
                  <div key={idx} className="hourCard">
                    <div className="small">{fmtHour(h.dt)}</div>
                    <div className="icon">{emojiFromCondition(h.conditionId)}</div>
                    <div className="t">{Math.round(h.tempC)}°</div>
                  </div>
                ))}
              </div>

              <div style={{ height: 12 }} />
              <div className="h2">Temperatura (24h)</div>
              <div className="chartWrap">
                {hourlyTemps.length ? <TempChart values={hourlyTemps} /> : null}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col" style={{ gap: 12 }}>
            {/* 7 days */}
            <div className="card">
              <div className="h2">Previsão (7 dias)</div>
              <div className="days">
                {data.days.map((d) => (
                  <div key={d.date} className="dayRow">
                    <div className="dayName">{fmtDay(d.date)}</div>
                    <div className="icon">{emojiFromCondition(d.conditionId)}</div>
                    <div className="dayMin">{Math.round(d.minC)}°</div>
                    <div className="barWrap">
                      <div className="bar" style={{ width: "70%" }} />
                    </div>
                    <div className="dayMax">{Math.round(d.maxC)}°</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Radar */}
            <div className="card">
              <div className="h2">Radar</div>
              <div className="small">
                Veja a movimentação de chuva no Brasil com loop temporal.
              </div>
              <div style={{ height: 10 }} />
              <a className="btn" href="/radar">Abrir radar do Brasil</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
