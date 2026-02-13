import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const city = url.searchParams.get("city") || "São Paulo";

    const key = process.env.OPENWEATHER_API_KEY;

    if (!key) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${key}`
    );

    const geo = await geoRes.json();

    if (!geo || geo.length === 0) {
      return NextResponse.json({ error: "Cidade não encontrada" }, { status: 404 });
    }

    const lat = geo[0].lat;
    const lon = geo[0].lon;
    const name = geo[0].name;

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`
    );

    const data = await weatherRes.json();

    return NextResponse.json({
      city: name,
      current: {
        tempC: data?.main?.temp ?? null,
        feelsLikeC: data?.main?.feels_like ?? null,
        humidity: data?.main?.humidity ?? null,
        pressure: data?.main?.pressure ?? null,
        windMs: data?.wind?.speed ?? null,
        description: data?.weather?.[0]?.description ?? "",
        icon: data?.weather?.[0]?.icon ?? ""
      }
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
