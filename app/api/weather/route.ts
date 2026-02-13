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

        tempC: data.main.temp,

        feelsLikeC: data.main.feels_like,

        humidity: data.main.humidity,

        pressure: data.main.pressure,

        windMs: data.wind.speed,

        description: data.weather[0].description,

        conditionId: data.weather[0].id,

        icon: data.weather[0].icon

      }

    });

  } catch (err) {

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );

  }
}
