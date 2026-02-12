import { NextResponse } from "next/server";

type OWGeoItem = { lat: number; lon: number; name: string };

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const city = (url.searchParams.get("city") || "São Paulo").trim();

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENWEATHER_API_KEY não configurada no Vercel" },
        { status: 500 }
      );
    }

    const geoUrl =
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}` +
      `&limit=1&appid=${apiKey}`;

    const geoRes = await fetch(geoUrl, { cache: "no-store" });
    const geoText = await geoRes.text();

    if (!geoRes.ok) {
      return NextResponse.json(
        { error: "OpenWeather geocoding falhou", status: geoRes.status, detail: geoText },
        { status: 502 }
      );
    }

    let geoJson: unknown;
    try {
      geoJson = JSON.parse(geoText);
    } catch {
      return NextResponse.json(
        { error: "Resposta inválida do OpenWeather (geocoding)", detail: geoText },
        { status: 502 }
      );
    }

    if (!Array.isArray(geoJson) || geoJson.length === 0) {
      return NextResponse.json(
        { error: "Cidade não encontrada no OpenWeather", city },
        { status: 404 }
      );
    }

    const first = geoJson[0] as OWGeoItem;
    const { lat, lon, name } = first;

    const weatherUrl =
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}` +
      `&units=metric&appid=${apiKey}`;

    const wRes = await fetch(weatherUrl, { cache: "no-store" });
    const wText = await wRes.text();

    if (!wRes.ok) {
      return NextResponse.json(
        { error: "OpenWeather weather falhou", status: wRes.status, detail: wText },
        { status: 502 }
      );
    }

    const wJson = JSON.parse(wText) as any;

    return NextResponse.json({
      city: name,
      current: { tempC: Number(wJson?.main?.temp ?? 0) },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Erro interno na rota /api/weather", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
