// Priority order: P1 > P2 > P3
export function comparePriority(a, b) {
  const order = { P1: 1, P2: 2, P3: 3 };
  if (order[a.priority] !== order[b.priority]) {
    return order[a.priority] - order[b.priority];
  }
  // If same priority, keep CSV order (assume original index is present)
  return a.csvIndex - b.csvIndex;
}

export function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function parseTimeString(timeStr, baseDate = new Date()) {
  // Accepts hh:mm or hh:mm:ss, returns Date object today at that time
  let [h, m, s] = (timeStr || '').split(':');
  if (h === undefined || m === undefined) return null;
  if (s === undefined) s = '00';
  const d = new Date(baseDate);
  d.setHours(Number(h), Number(m), Number(s), 0);
  return d;
} 