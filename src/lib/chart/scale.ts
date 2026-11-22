export type Pt = { date: string; value: number };

export function layout(
  series: Pt[][],
  ref: number | null,
  w: number,
  h: number,
  pad = { l: 56, r: 48, t: 16, b: 28 }
) {
  const all = series.flat();
  const vals = all.map((p) => p.value).concat(ref === null ? [] : [ref]);
  const t = all.map((p) => Date.parse(p.date));
  const t0 = Math.min(...t);
  const t1 = Math.max(...t);
  const v0 = Math.min(...vals) * 0.9;
  const v1 = Math.max(...vals) * 1.1;
  const x = (d: string) =>
    t1 === t0
      ? pad.l + (w - pad.l - pad.r) / 2
      : pad.l + ((Date.parse(d) - t0) / (t1 - t0)) * (w - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - v0) / (v1 - v0 || 1)) * (h - pad.t - pad.b);
  const ticks = [0, 1, 2, 3].map((i) => v0 + ((v1 - v0) * i) / 3);
  const path = (s: Pt[]) =>
    s.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  return { x, y, ticks, path };
}
