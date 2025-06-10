import { Suspense } from "react";
import Experience from "./experience/Experience";

function App() {
  return (
    <main className="w-full h-screen bg-black">
      <div className="crosshair">
        <div className="crosshair-dot"></div>
      </div>

      <Suspense fallback={<p>Loading...</p>}>
        <Experience />
      </Suspense>
    </main>
  );
}

export default App;
