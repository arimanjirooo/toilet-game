export const MIN_VOTES = 30;
export type Counts = Record<string, number>;
export function judge(counts: Counts, choice: string, threshold = MIN_VOTES) {
  const total = Object.values(counts).reduce((a,b)=>a+b,0);
  const max = Math.max(0,...Object.values(counts));
  const leaders = Object.keys(counts).filter(k => counts[k] === max && max > 0);
  return { total, leaders, status: total < threshold ? 'pending' : leaders.includes(choice) ? (leaders.length > 1 ? 'tie' : 'majority') : 'minority' };
}
