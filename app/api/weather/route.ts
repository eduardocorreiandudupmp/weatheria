import { NextResponse } from "next/server";
type OWGeoItem = { lat: number; lon: number; name: string };
export async function GET(req: Request) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENWEATHER_API_KEY não configurada no Vercel" }, { status: 500 });
  const url = new URL(req.url);
  const city = (url.searchParams.get("city") || "São Paulo").trim();
  const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`);
  const geoArr = (await geoRes.json()) as OWGeoItem[];
  if (!geoArr?.length) return NextResponse.json({ error: "Cidade não encontrada", city }, { status: 404 });
  const { lat, lon, name } = geoArr[0];
  const curRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
  const cur = await curRes.json();
  return NextResponse.json({ city: name, current: { tempC: Number(cur.main?.temp ?? 0) } });
}
