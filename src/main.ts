import './style.css';
import { voteBreakdown } from './vote-breakdown';
import { questions } from './questions';
import { room, legend } from './room';
import { submitVote, online, type Receipt } from './votes';
import { judge, MIN_VOTES } from './results';
const app = document.querySelector<HTMLDivElement>('#app')!;
let index = 0;
let answers: Receipt[] = [];
let busy = false;
const brand = `<a class="brand" href="${import.meta.env.BASE_URL}" aria-label="タイトルに戻る"><span class="brand-icon">↟</span>どこに立つ？<small>THE URINAL DILEMMA</small></a>`;
const header = () => `<header>${brand}<span class="mode"><i></i>${online?'オンライン投票':'ローカルでプレイ'}</span></header>`;
const footer = `<footer><span>たかが立ち位置。されど立ち位置。</span><span>NO RIGHT PLACE. JUST YOUR PLACE.</span></footer>`;
function mount(content: string) { app.innerHTML = header()+content+footer; window.scrollTo(0,0); document.querySelector<HTMLElement>('h1')?.focus({preventScroll:true}); }
function home() {
 mount(`<main class="home"><section class="hero-copy"><div class="eyebrow">日常の、どうでもいい大問題。 / VOL. 01</div><h1 tabindex="-1">空いている。<br>なのに、<em>迷う。</em></h1><p class="intro">その一歩に、あなたが出る。<br>${questions.length}のトイレで考える、小さな心理ゲーム。</p><button class="primary" id="start">立ち位置を決める <span>↗</span></button><p class="micro">全${questions.length}問 · 約${Math.ceil(questions.length / 5)}分 · 登録不要</p></section><section class="hero-visual"><div class="visual-top"><span>CASE 01</span><span>あなたなら、どこ？ ↙</span></div>${room(questions[0],undefined,true)}<div class="visual-bottom"><span class="pill">正解は、みんなの選択。</span><span>迷う時間も、ゲームです。</span></div></section><section class="how"><article><span>01 / LOOK</span><h2>状況を見る</h2><p>入口、先客、足元。<br>ちょっと気になる配置を観察。</p></article><article><span>02 / CHOOSE</span><h2>直感で選ぶ</h2><p>空いている小便器をタップ。<br>理由は、あとからついてくる。</p></article><article><span>03 / DISCOVER</span><h2>みんなと比べる</h2><p>1問ごとに票数を表示。30票から多数派を判定。<br>マナーの正解を決めるゲームではありません。</p></article></section><p class="local-note">${online?'投票は匿名で集計。同じ問題への投票は初回の選択を使います。':'現在はローカルモード。選択はこの端末に保存され、みんなの集計には送信されません。'}</p></main>`);
 document.querySelector('#start')!.addEventListener('click',()=>{index=0;answers=[];question();});
}
function question() {
 const q = questions[index];
 mount(`<main class="play"><div class="question-top"><span class="eyebrow">THE DILEMMA</span><span><b>${String(index+1).padStart(2,'0')}</b> / ${questions.length}</span></div><div class="progress"><i style="width:${index/questions.length*100}%"></i></div><h1 tabindex="-1">${q.title}</h1><p class="description">${q.description}</p>${room(q)}${legend}<div class="choose-prompt" role="status"><span>☝</span> 空いている小便器をタップ</div><p class="micro center">${q.note}</p><div id="result"></div></main>`);
 document.querySelectorAll<HTMLButtonElement>('[data-choice]:not(:disabled)').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.choice!)));
}
async function choose(choice: string) {
 if(busy) return; busy=true;
 document.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach(b=>b.disabled=true);
 document.querySelector('.choose-prompt')!.textContent='あなたの立ち位置を記録しています…';
 const receipt = await submitVote(questions[index],choice);
 answers[index] = receipt; busy=false; showResult(receipt);
}
function showResult(r: Receipt) {
 const q = questions[index]; const result = judge(r.counts,r.choice);
 document.querySelector('.room')!.outerHTML=room(q,r.choice);
 document.querySelector('.choose-prompt')?.remove();
 const labels:Record<string,string> = {pending:'集計中',majority:'あなたは多数派！',tie:'あなたは同率最多！',minority:'あなたは少数派！'};
 document.querySelector('#result')!.innerHTML=`<section class="result" aria-live="polite"><div class="result-top"><span class="eyebrow">YOUR CHOICE — ${r.choice}</span><span class="pill">${labels[result.status]}</span></div>${voteBreakdown(q,r)}<h2 tabindex="-1">${q.comments[r.choice] || ['ここを選ぶまでに、脳内で小さな会議があった。','一歩の決断。心の中では、壮大なドラマ。','その場所に決めた理由、ちょっと聞いてみたい。'][index%3]}</h2><p>${r.source==='local'?'今回の選択で結果を表示しています。みんなの投票は未接続です。':r.source==='unavailable'?(r.saved?'投票は保存済みですが、集計を取得できませんでした。':'通信できず、投票は未確認です。再試行して確認できます。'):`実際の投票 ${result.total}票${result.total<MIN_VOTES?` / ${MIN_VOTES}票から多数派を判定`:' · 現時点の集計'}`}</p>${r.repeated?'<p class="notice">今回は選び直した便器で結果を表示しています。集計に使うのは初回の1票です（追加投票なし）。</p>':''}${!r.persistent?'<p class="notice">端末への保存が使えないため、このページを開いている間だけ記録します。</p>':''}${result.status==='pending'?'<p class="pending-note">判定は、もう少し仲間が集まってから。</p>':''}${result.leaders.length>1 && result.total>=MIN_VOTES?`<p>同率最多：${result.leaders.join('・')}。いずれも最多票として扱います。</p>`:''}${r.source==='unavailable'?'<button class="secondary" id="retry">保存・集計を再試行</button>':''}<button class="primary" id="next">${index===questions.length-1?'最終結果を見る':'次のトイレへ'} <span>→</span></button></section>`;
 document.querySelector('#next')!.addEventListener('click',()=>{index++;index===questions.length?finish():question();});
 document.querySelector('#retry')?.addEventListener('click',async()=>{if(busy)return;busy=true;const b=document.querySelector<HTMLButtonElement>('#retry')!;b.disabled=true;b.textContent='確認中…';const next=await submitVote(q,r.choice);answers[index]=next;busy=false;document.querySelector('#result')!.innerHTML='';showResult(next);});
 document.querySelector<HTMLElement>('.result h2')!.focus({preventScroll:true});
 document.querySelector('.result')!.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}
function finish() {
 const judged = answers.map(r=>judge(r.counts,r.choice));
 const ready=judged.filter(r=>r.status!=='pending').length;
 const hits=judged.filter(r=>r.status==='majority'||r.status==='tie').length;
 mount(`<main class="finish"><div class="eyebrow">ALL ${questions.length} PLACES, YOUR CHOICES.</div><h1 tabindex="-1">おつかれさま。<br>立ち位置にも、<em>個性。</em></h1><p class="description">${questions.length}回の小さな決断、いかがでしたか？</p><div class="score"><span>多数派と一致（同率最多を含む）</span><strong>${ready?`${hits}<small> / ${ready}問</small>`:'集計中'}</strong><p>${questions.length-ready}問は判定保留</p></div><div class="recap">${answers.map((r,i)=>`<div><span>${String(i+1).padStart(2,'0')} ${questions[i].title}</span><b>${r.choice}</b><small>${judged[i].status==='pending'?'集計中':judged[i].status==='tie'?'同率最多':judged[i].status==='majority'?'多数派':'少数派'}</small></div>`).join('')}</div><p class="micro">集計は回答時点の結果です。選択に客観的な正解・不正解はありません。</p><button class="primary" id="share">友達にも、聞いてみる <span>↗</span></button><p id="share-status" role="status"></p><button class="secondary" id="again">もう一度プレイ</button><p class="micro">再プレイでも、投票は初回の1票だけ。</p></main>`);
 document.querySelector('#again')!.addEventListener('click',()=>{index=0;answers=[];question();});
 document.querySelector('#share')!.addEventListener('click',async()=>{const text=`どこに立つ？ ${questions.length}のトイレで迷ってみた。${ready?`多数派と一致：${hits}/${ready}問。`:'みんなの投票は集計中。'}`;try{if(navigator.share)await navigator.share({title:'どこに立つ？',text,url:location.href});else{await navigator.clipboard.writeText(`${text} ${location.href}`);document.querySelector('#share-status')!.textContent='リンクをコピーしました。';}}catch(e){if((e as Error).name!=='AbortError'){document.querySelector('#share-status')!.textContent='アドレスバーのURLをコピーして共有してください。';}}});
}
home();




