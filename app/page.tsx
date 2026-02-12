"use client";
import { useEffect, useState } from "react";

export default function Page(){
  const [temp,setTemp]=useState<number|null>(null);
  const [city,setCity]=useState("São Paulo");

  async function load(){
    const r=await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    const j=await r.json();
    setTemp(j.current?.tempC??null);
  }

  useEffect(()=>{load()},[]);

  return (
    <div>
      <h1>WeatherAI</h1>
      <input value={city} onChange={e=>setCity(e.target.value)}/>
      <button className="btn" onClick={load}>Buscar</button>
      {temp!==null && <h2>{temp}°C</h2>}
      <br/>
      <a href="/pro">Virar PRO</a>
    </div>
  );
}
