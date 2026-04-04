import { Suspense } from "react";
import ScriptViewer from "@/frontend/wizard/ScriptViewer";

export default function ScriptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface ben-day-dots">
          <span
            className="font-headline text-5xl font-black italic text-primary"
            style={{ filter: "drop-shadow(4px 4px 0px rgba(0,0,0,1))" }}
          >
            LOADING...
          </span>
        </div>
      }
    >
      <ScriptViewer />
    </Suspense>
  );
}
