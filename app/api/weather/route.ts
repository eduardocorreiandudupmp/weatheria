import { NextResponse } from "next/server";

export async function GET(req:Request){
  const url=new URL(req.url);
  const city=url.searchParams.get("city")||"São Paulo";
  const key=process.env.OPENWEATHER_API_KEY;
  const geo=await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${key}`).then(r=>r.json());
  const {lat,lon,name}=geo[0];
  const data=await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`).then(r=>r.json());
  return NextResponse.json({
    city:name,
    current:{tempC:data.main.temp}
  });
}
