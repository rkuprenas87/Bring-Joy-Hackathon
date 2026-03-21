import FloatingBoard from "@/components/FloatingBoard";
import HomeClientUI from "@/components/HomeClientUI";
import NoteCounter from "@/components/NoteCounter";

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-end pb-12">
      {/* Sky Background */}
      <div className="sky-bg" />

      {/* Animated Clouds */}
      <div className="cloud cloud--1" />
      <div className="cloud cloud--2" />
      <div className="cloud cloud--3" />
      <div className="cloud cloud--4" />
      <div className="cloud cloud--5" />
      <div className="cloud cloud--6" />
      <div className="cloud cloud--7" />
      <div className="cloud cloud--8" />

      {/* Wind Streaks */}
      <div className="wind-streaks">
        <div className="wind-streak" style={{ top: "15%", width: "200px", ["--wind-duration" as string]: "3.5s", ["--wind-delay" as string]: "0s" }} />
        <div className="wind-streak" style={{ top: "30%", width: "280px", ["--wind-duration" as string]: "4.5s", ["--wind-delay" as string]: "1.5s" }} />
        <div className="wind-streak" style={{ top: "45%", width: "160px", ["--wind-duration" as string]: "3s", ["--wind-delay" as string]: "3s" }} />
        <div className="wind-streak" style={{ top: "55%", width: "240px", ["--wind-duration" as string]: "5s", ["--wind-delay" as string]: "0.5s" }} />
        <div className="wind-streak" style={{ top: "70%", width: "180px", ["--wind-duration" as string]: "4s", ["--wind-delay" as string]: "2s" }} />
        <div className="wind-streak" style={{ top: "22%", width: "220px", ["--wind-duration" as string]: "5.5s", ["--wind-delay" as string]: "4s" }} />
      </div>

      {/* Edge fade masks so notes dissolve at viewport edges */}
      <div className="edge-fade-top" />
      <div className="edge-fade-bottom" />

      {/* Page Title */}
      <div className="absolute top-8 left-0 right-0 z-10 flex flex-col items-center pointer-events-none select-none">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
          Paper Sky
        </h1>
        <p className="mt-2 text-sm sm:text-base text-white/70 font-medium tracking-wide drop-shadow-sm">
          send a little kindness into the sky
        </p>
      </div>

      {/* The Floating Notes Board (Server Component that fetches data) */}
      <FloatingBoard />

      {/* Foreground Interactive UI (Client Component) */}
      <HomeClientUI />

      {/* Live Note Counter */}
      <NoteCounter />
    </main>
  );
}
