"use client";

import { useEffect, useState } from "react";

export default function RadarMapLoop() {
  const [frame, setFrame] = useState(0);
  const frames = [
    "https://tilecache.rainviewer.com/v2/radar/nowcast/0/256/{z}/{x}/{y}/2/1_1.png",
    "https://tilecache.rainviewer.com/v2/radar/nowcast/1/256/{z}/{x}/{y}/2/1_1.png",
    "https://tilecache.rainviewer.com/v2/radar/nowcast/2/256/{z}/{x}/{y}/2/1_1.png",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <iframe
      src={`https://www.rainviewer.com/map.html?layer=radar&frame=${frame}&center=-23.55,-46.63&zoom=6`}
      width="100%"
      height="500"
      style={{ border: "none", borderRadius: "16px" }}
    />
  );
}
