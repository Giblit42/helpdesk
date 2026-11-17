import { useEffect, useState } from "react";
import type { HealthResponse } from "@helpdesk/shared";

type State =
  | { kind: "loading" }
  | { kind: "ok"; data: HealthResponse }
  | { kind: "error"; message: string };

export default function App() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/health", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setState({ kind: "ok", data: (await res.json()) as HealthResponse });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({ kind: "error", message: err instanceof Error ? err.message : String(err) });
      });
    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Helpdesk</h1>
        <p className="mt-1 text-sm text-slate-500">AI-powered ticket management</p>

        <div className="mt-6 flex items-center gap-2 text-sm">
          <span
            className={
              "h-2.5 w-2.5 rounded-full " +
              (state.kind === "ok"
                ? "bg-emerald-500"
                : state.kind === "error"
                  ? "bg-red-500"
                  : "bg-slate-300")
            }
          />
          {state.kind === "loading" && <span>Checking API…</span>}
          {state.kind === "ok" && (
            <span>
              API healthy · up {state.data.uptime.toFixed(0)}s
            </span>
          )}
          {state.kind === "error" && <span>API unreachable: {state.message}</span>}
        </div>
      </div>
    </main>
  );
}
