import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {

    const url = new URL(req.url);
    const city = url.searchParams.get("city") || "São Paulo";

    const key = process.env.OPENWEATHER_API_KEY;

    if (!key) {
      return NextResponse.json(
        { error: "OPENWEATHER_API_KEY não configurada" },
        { status: 500 }
      );
    }

    // obter coordenadas
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${key}`
    );

    const geo = await geoRes.json();

    if (!geo.length) {
      return NextResponse.json(
        { error: "Cidade não encontrada" },
        { status: 404 }
      );
    }

    const { lat, lon, name } = geo[0];

    // obter clima atual completo
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${key}`
    );

    const data = await weatherRes.json();

    return NextResponse.json({
  city: name,
  current: {
    tempC: Number(data.main?.temp ?? 0),
    feelsLikeC: Number(data.main?.feels_like ?? 0),
    humidity: Number(data.main?.humidity ?? 0),
    pressure: Number(data.main?.pressure ?? 0),
    windMs: Number(data.wind?.speed ?? 0),
    description: String(data.weather?.[0]?.description ?? ""),
    conditionId: Number(data.weather?.[0]?.id ?? 800),
    icon: String(data.weather?.[0]?.icon ?? ""),
  },
});
