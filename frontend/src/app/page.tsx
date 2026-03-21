import FloatingBoard from "../components/FloatingBoard";
import HomeClientUI from "../components/HomeClientUI";

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#e0f2fe_0%,#f0f9ff_30%,#ffffff_70%)]">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(125,211,252,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(125,211,252,0.12)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-8 p-6">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-sky-900 text-center">
          Bring Joy
        </h1>
        <p className="max-w-2xl text-center text-sky-700/80 text-base sm:text-lg">
          Send kind notes into the sky and watch them float by.
        </p>
        <HomeClientUI />
      </section>
      <FloatingBoard />
    </main>
  );
}
