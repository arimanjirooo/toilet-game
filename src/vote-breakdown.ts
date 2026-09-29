import type { Question } from './questions';
import type { Receipt } from './votes';
import { judge, MIN_VOTES } from './results';

export function voteBreakdown(q: Question, receipt: Receipt): string {
  const available = receipt.source === 'online';
  const { total } = judge(receipt.counts, receipt.choice);
  return `<section class="vote-breakdown" aria-label="この問題の投票結果"><div class="vote-heading"><h3>この問題の投票結果</h3><span>${available ? `合計 <b>${total}票</b>` : '票数未取得'}</span></div><p>${available ? (total < MIN_VOTES ? `集計中 · ${MIN_VOTES}票までは多数派の判定を保留します。` : '初回の投票を含む、回答時点の集計です。') : '集計中 · 実際の票数を取得するまで、得票は表示しません。'}</p><div class="${available ? 'bars' : 'vote-placeholders'}">${q.fixtures.filter(f => f.state === 'free').map(f => {
    const count = receipt.counts[f.id] || 0;
    const percent = total ? Math.round(count / total * 100) : 0;
    return `<div class="bar-row"><b>${f.id}${f.id === receipt.choice ? ' ●' : ''}</b><div class="bar-track">${available ? `<i style="width:${percent}%"></i>` : ''}</div><span>${available ? `${count}票 <small>(${percent}%)</small>` : '—'}</span></div>`;
  }).join('')}</div><p class="micro">● 今回の選択</p></section>`;
}

