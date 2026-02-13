"use client";
import { useEffect, useState } from "react";
import { apiJson } from "../lib/client";

export default function Home(){
  const [city,setCity]=useState("São Paulo");
  const [temp,setTemp]=useState<number|null>(null);
  async function load(){
    const d = await apiJson<any>(`/api/weather?city=${encodeURIComponent(city)}`);
    setTemp(d.current.tempC);
  }
  useEffect(()=>{load();},[]);
  return (
    <div className="container">
      <h1>WeatherIA</h1>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <input className="input" value={city} onChange={e=>setCity(e.target.value)} />
        <button className="btn" onClick={load}>Buscar</button>
        <a className="btn" href="/radar">Radar</a>
        <a className="btn" href="/push">Push</a>
      </div>
      <h2>{temp===null?"—":`${temp.toFixed(1)}°C`}</h2>
    </div>
  );
}
