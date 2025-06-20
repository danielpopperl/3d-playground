"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./components/3d/Scene"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function App() {
  return (
    <main className="w-full h-full bg-black">
      <div className="crosshair">
        <div className="crosshair-dot"></div>
      </div>

      <Scene />
    </main>
  );
}
