"use client";
import { useEffect, useRef } from "react";

type Mode = "clear" | "clouds" | "rain" | "storm" | "snow" | "fog";

function modeFromCondition(id?: number): Mode {
  if (!id) return "clouds";
  if (id >= 200 && id < 300) return "storm";
  if (id >= 300 && id < 600) return "rain";
  if (id >= 600 && id < 700) return "snow";
  if (id >= 700 && id < 800) return "fog";
  if (id === 800) return "clear";
  return "clouds";
}

export default function WeatherCanvas({ conditionId }: { conditionId?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c0 = ref.current;
    if (!c0) return;

    const ctx = c0.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const mode = modeFromCondition(conditionId);

    const clouds = Array.from({ length: 10 }).map(() => ({
      x: Math.random(),
      y: 0.12 + Math.random() * 0.4,
      s: 0.25 + Math.random() * 0.55,
      v: 0.02 + Math.random() * 0.03,
      o: 0.1 + Math.random() * 0.16,
    }));

    const drops = Array.from({ length: 220 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      l: 0.03 + Math.random() * 0.08,
      v: 0.8 + Math.random() * 1.7,
    }));

    function resize() {
      const canvas = ref.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c0);

    function drawCloud(cx: number, cy: number, s: number, alpha: number) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      const w = s * 240,
        h = s * 72;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.35, h * 0.45, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - w * 0.22, cy + h * 0.05, w * 0.28, h * 0.42, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + w * 0.2, cy + h * 0.08, w * 0.3, h * 0.44, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function flash(w: number, h: number, intensity: number) {
      ctx.save();
      ctx.globalAlpha = intensity;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    function frame() {
      const canvas = ref.current;
      if (!canvas) return;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      t += 0.016;

      ctx.clearRect(0, 0, w, h);

      const g = ctx.createRadialGradient(w * 0.5, h * 0.2, 40, w * 0.5, h * 0.2, w);
      g.addColorStop(0, "rgba(80,160,255,0.20)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      if (mode !== "clear") {
        for (const cl of clouds) {
          cl.x = (cl.x + cl.v * 0.004) % 1.2;
          drawCloud(w * (cl.x - 0.1), h * cl.y, cl.s, cl.o);
        }
      }

      if (mode === "rain" || mode === "storm") {
        ctx.save();
        ctx.strokeStyle = "rgba(190,220,255,0.60)";
        ctx.lineWidth = 1;
        for (const d of drops) {
          d.y += d.v * 0.016;
          d.x += 0.12 * 0.016;

          if (d.y > 1.1) {
            d.y = -0.1;
            d.x = Math.random();
          }
          if (d.x > 1.1) d.x = -0.1;

          const x = w * d.x;
          const y = h * d.y;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 10, y + d.l * h);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (mode === "storm") {
        const p = (Math.sin(t * 2.6) + 1) * 0.5;
        if (p > 0.995) flash(w, h, 0.55);
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [conditionId]);

  return <canvas ref={ref} className="heroCanvas" />;
}
