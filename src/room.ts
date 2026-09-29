import type { Question } from './questions';
export function room(q: Question, selected?: string, preview = false) {
  return `<div class="room ${preview ? 'preview' : ''} ${q.fixtures.some(f => f.facing === 'up') ? 'two-rows' : ''}" aria-label="トイレを上から見た配置図">
    <span class="room-caption">TOP VIEW / 上から見た図</span>
    ${q.wet.map(w=>`<div class="wet" style="left:${(w.x+130)/3.6}%;top:${w.y/2.7}%;width:${w.width/3.6}%;height:${w.height/2.7}%"><span>水濡れ</span></div>`).join('')}
    ${q.partitions.map(p=>`<div class="partition" style="left:${(p.x+130)/3.6}%;top:${p.y/2.7}%;height:${p.height/2.7}%"></div>`).join('')}
    ${q.sinks.map(s=>`<div class="sink ${s.occupied?'sink-occupied':''}" role="img" aria-label="洗面台 ${s.occupied?'手洗い中の人がいます':'空き'}" style="left:${(s.x+130)/3.6}%;top:${s.y/2.7}%"><svg class="sink-basin" viewBox="0 0 58 40" aria-hidden="true"><rect x="2" y="2" width="54" height="36" rx="7" fill="#faffff" stroke="#548d98" stroke-width="2"/><rect x="10" y="7" width="38" height="22" rx="9" fill="#d8edf0" stroke="#8fb7bd"/><circle cx="29" cy="16" r="2" fill="#548d98"/><path d="M29 35v-9h7" fill="none" stroke="#548d98" stroke-width="4" stroke-linecap="round"/></svg>${s.occupied?'<span class="sink-person"><i></i></span>':''}<span class="sink-label">${s.occupied?'手洗い中':'洗面台'}</span></div>`).join('')}
    ${q.fixtures.map(f=>`<button class="fixture ${f.state} ${f.facing || 'down'} ${selected===f.id?'selected':''}" data-choice="${f.id}" style="left:${(f.x+130)/3.6}%;top:${f.y/2.7}%" ${preview || selected || f.state!=='free'?'disabled':''} aria-label="${f.id} ${f.handrail?'手すり付き ':''}${f.state==='occupied'?'使用中':f.state==='broken'?'故障中':'空き・選択する'}">${f.handrail?'<span class="handrails" aria-hidden="true"><i></i><i></i></span>':''}<span class="porcelain"><i></i></span><span class="fixture-label">${f.id}</span>${f.state==='occupied'?'<span class="person"><i></i></span>':''}${f.state==='broken'?'<span class="broken-sign">× 故障</span>':''}${selected===f.id?'<span class="you">YOU</span>':''}</button>`).join('')}
    <div class="entrance ${q.entrance}"><span>入口</span><b>${q.entrance==='left'?'→':q.entrance==='right'?'←':'↑'}</b></div>
  </div>`;
}
export const legend = `<div class="legend"><span><i class="dot free-dot"></i>空き</span><span><i class="dot person-dot"></i>使用中</span><span><i class="line-dot"></i>仕切り</span><span><i class="rail-dot"></i>手すり</span><span><i class="dot wet-dot"></i>水濡れ</span><span><i class="broken-dot">×</i>故障中</span><span><i class="sink-dot"></i>洗面台</span></div>`;




