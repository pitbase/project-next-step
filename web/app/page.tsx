export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-3xl font-bold">Project Next Step (Beta)</h1>
        <p className="text-slate-600">
          You’re not broken. You’re distracted. We fix that by doing one clear next step.
        </p>

        <a
          className="inline-block w-full text-center bg-black text-white rounded-xl px-4 py-3 font-semibold"
          href="/app/brain-dump"
        >
          Start
        </a>

        <p className="text-xs text-slate-500">Dev build. No login yet.</p>
      </div>
    </main>
  );
}
