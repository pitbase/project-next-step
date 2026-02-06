export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-3xl font-bold">Project Next Step</h1>

        <p className="text-slate-600">
          Stop distractions. Do one next step. Feel peace.
        </p>

        <a
          className="inline-block w-full text-center bg-black text-white rounded-xl px-4 py-3 font-semibold"
          href="/app/brain-dump"
        >
          Start
        </a>

        <a
          className="inline-block w-full text-center border rounded-xl px-4 py-3 font-semibold"
          href="/app/setup"
        >
          Setup (Quick Talk + Schedule)
        </a>

        <a
          className="inline-block w-full text-center border rounded-xl px-4 py-3 font-semibold"
          href="/app/routines"
        >
          Daily Routines (repeat every day)
        </a>

        <a
          className="inline-block w-full text-center border rounded-xl px-4 py-3 font-semibold"
          href="/app/settings"
        >
          Blocked Sites
        </a>

        <a
          className="inline-block w-full text-center border rounded-xl px-4 py-3 font-semibold"
          href="/app/shield"
        >
          Shield (Focus ON/OFF)
        </a>

        <p className="text-xs text-slate-500">Dev build. No login yet.</p>
      </div>
    </main>
  );
}
