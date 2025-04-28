// Priority order: P1 > P2 > P3
export function comparePriority(a, b) {
  const order = { P1: 1, P2: 2, P3: 3 };
  if (order[a.priority] !== order[b.priority]) {
    return order[a.priority] - order[b.priority];
  }
  // If same priority, keep CSV order (assume original index is present)
  return a.csvIndex - b.csvIndex;
} 