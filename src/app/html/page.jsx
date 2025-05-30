"use client";

import saveAsImage from "../utils/exportAsImage";

export default function Card() {
  return (
    <div
      id="capture-frame"
      className="w-full h-full flex items-center justify-center"
    >
      <div className="w-full h-full bg-white rounded-lg shadow-lg">
        <div className="p-4">
          <h2 className="text-xl font-bold">Card Title</h2>
          <p className="text-gray-700">This is a simple card component.</p>
        </div>
        <button onClick={saveAsImage}>
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Click Me
          </div>
        </button>
      </div>
    </div>
  );
}
