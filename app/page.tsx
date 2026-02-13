"use client";

import { useEffect, useState } from "react";
import WeatherCanvas from "../components/WeatherCanvas";

export default function HomePage() {

  const [city, setCity] = useState("São Paulo");
  const [temp, setTemp] = useState<number | null>(null);

  async function loadWeather(c: string) {
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(c)}`);
      const data = await res.json();
      setTemp(data.current.tempC);
    } catch {}
  }

  useEffect(() => {
    loadWeather(city);
  }, []);

  return (
    <div className="container">

      <div className="card cardHero">

        <WeatherCanvas conditionId={800} />

        <div className="cardInner">

          <h1 style={{fontSize:32,fontWeight:900}}>
            WeatherIA
          </h1>

          <div style={{height:10}} />

          <div className="row">

            <input
              className="input"
              value={city}
              onChange={(e)=>setCity(e.target.value)}
            />

            <button
              className="btn"
              onClick={()=>loadWeather(city)}
            >
              Buscar
            </button>

            <a href="/radar" className="btn">
              Radar
            </a>

            <a href="/push" className="btn">
              Push
            </a>

          </div>

          <div style={{height:20}} />

          {temp !== null && (
            <div className="bigTemp">
              {Math.round(temp)}°
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
