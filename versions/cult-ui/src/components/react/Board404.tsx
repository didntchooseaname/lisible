import { useEffect, useState } from "react";
import { LightBoard } from "@/components/ui/lightboard";

export function Board404() {
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setReady(true);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card p-4"
    >
      {ready && !reduced ? (
        <LightBoard
          rows={11}
          lightSize={5}
          gap={2}
          updateInterval={110}
          disableDrawing
          text="404 NOT FOUND"
          font="default"
          colors={{
            background: "rgba(115, 115, 115, 0.16)",
            textDim: "rgba(34, 197, 94, 0.4)",
            drawLine: "rgba(34, 197, 94, 0.7)",
            textBright: "rgba(34, 197, 94, 0.95)",
          }}
        />
      ) : (
        <p className="my-2 text-center font-mono text-6xl font-bold tracking-tight text-accent md:text-7xl">
          404
        </p>
      )}
    </div>
  );
}

export default Board404;
