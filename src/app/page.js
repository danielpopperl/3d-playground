import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./components/3d/scene"), {
  ssr: !!false,
  loading: () => <p>Loading...</p>,
});

export default function Home() {
  return (
    <div className="w-full h-full bg-black">
      <Scene />
    </div>
  );
}
