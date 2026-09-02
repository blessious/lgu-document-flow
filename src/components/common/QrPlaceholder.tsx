import { cn } from "@/lib/utils";

/**
 * Deterministic decorative QR-like matrix. No real QR encoding happens in
 * this prototype — it only illustrates the printed label.
 */
export function QrPlaceholder({ value, size = 128, className }: { value: string; size?: number; className?: string }) {
  const cells = 21;
  let seed = 0;
  for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) % 100000;

  const filled: boolean[] = [];
  let s = seed || 7;
  for (let i = 0; i < cells * cells; i++) {
    s = (s * 1103515245 + 12345) % 2147483648;
    filled.push(s % 100 > 52);
  }
  const isFinder = (r: number, c: number) => {
    const inBox = (r0: number, c0: number) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
    return inBox(0, 0) || inBox(0, cells - 7) || inBox(cells - 7, 0);
  };
  const finderOn = (r: number, c: number) => {
    const lr = r < 7 ? r : r - (cells - 7);
    const lc = c < 7 ? c : c - (cells - 7);
    const edge = lr === 0 || lr === 6 || lc === 0 || lc === 6;
    const core = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
    return edge || core;
  };

  return (
    <div
      className={cn("rounded-md bg-white p-2 shadow-sm ring-1 ring-border", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`QR label placeholder for ${value}`}
    >
      <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${cells}, 1fr)` }}>
        {Array.from({ length: cells * cells }).map((_, i) => {
          const r = Math.floor(i / cells);
          const c = i % cells;
          const on = isFinder(r, c) ? finderOn(r, c) : filled[i];
          return <span key={i} style={{ backgroundColor: on ? "#0f172a" : "transparent" }} />;
        })}
      </div>
    </div>
  );
}
