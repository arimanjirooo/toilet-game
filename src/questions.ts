export type Sink = { id: string; x: number; y: number; occupied: boolean };
export type Fixture = { id: string; x: number; y: number; facing?: 'down' | 'up'; state: 'free' | 'occupied' | 'broken'; handrail?: boolean };
export type Question = { id: string; title: string; description: string; note: string; fixtures: Fixture[]; sinks: Sink[]; entrance: 'left' | 'right' | 'bottom'; partitions: { x: number; y: number; height: number }[]; wet: { x: number; y: number; width: number; height: number }[]; comments: Record<string, string> };
const row = (states: Fixture['state'][], y = 20, facing: Fixture['facing'] = 'down'): Fixture[] => states.map((state, i) => ({ id: String.fromCharCode(65 + i), x: 50 + (i - (states.length - 1) / 2) * 64, y, facing, state }));
const make = (id: string, title: string, description: string, states: Fixture['state'][], entrance: Question['entrance'], options: Partial<Question> & { handrails?: string[] } = {}): Question => {
  const { handrails = [], ...extra } = options;
  return { id, title, description, note: '直感で、ひとつ選んでください。', entrance, sinks: [], partitions: [], wet: [], comments: {}, ...extra, fixtures: (extra.fixtures || row(states)).map(f => ({ ...f, handrail: handrails.includes(f.id) })) };
};
// Hand-authored row patterns: . = free, o = occupied, x = broken.
// Keep at most five fixtures per row so mobile tap targets stay readable.
const paired = (top: string, bottom = ''): Fixture[] => {
  const states = (pattern: string): Fixture['state'][] => [...pattern].map(c => c === 'o' ? 'occupied' : c === 'x' ? 'broken' : 'free');
  return [...row(states(top)), ...row(states(bottom), 220, 'up').map((f, i) => ({ ...f, id: String.fromCharCode(65 + top.length + i) }))];
};
// New layouts use new IDs so votes from the first edition remain separate.
export const questions: Question[] = [
  make('v2-empty-01', '貸し切り、どこに立つ？', '4台とも空き。入口は左、手すりも仕切りもない。あなたの定位置は？', ['free','free','free','free'], 'left', { comments: { A: '入口から最短で着地。迷いのない一歩。', D: '貸し切りの奥へ。ひとりでも、場所にはこだわる。' } }),
  make('v2-handrail-02', '手前に、手すりがある。', 'さっきと同じ4台。今度は入口に一番近いAだけ手すり付き。選ぶ場所は変わる？', ['free','free','free','free'], 'left', { handrails: ['A'], comments: { A: '手すり付きの一台へ。その決め手、ちょっと聞いてみたい。', D: '奥の一台を選択。入口からここまで、心は決まっていた？' } }),
  make('v2-distance-03', '先客との、ちょうどいい距離。', '真ん中のCに先客。入口に近いAは手すり付き、反対の端のEには手すりがない。', ['free','free','occupied','free','free'], 'left', { handrails: ['A'] }),
  make('v2-entrance-04', '入口が、反対側なら。', '今度は右から入る。Cに先客、手前のEに手すり。左右が変わると迷いも変わる？', ['free','free','occupied','free','free'], 'right', { handrails: ['E'] }),
  make('v2-partition-05', '仕切りがあれば、隣でも？', 'Bに先客。各台の間には仕切りがあり、入口に近いAには手すりもある。', ['free','occupied','free','free'], 'left', { handrails: ['A'], partitions: [{ x:-14,y:15,height:83 },{ x:50,y:15,height:83 },{ x:114,y:15,height:83 }] }),
  make('v4-sinks-wet-06', '足元と、手洗いの距離。', '小便器はすべて空き。手すり付きAの前は水濡れ。向かいの洗面台では、右側でひとり手洗い中。', ['free','free','free','free'], 'left', { handrails: ['A'], wet: [{ x:-67,y:82,width:60,height:48 }], sinks: [{id:'S1',x:-30,y:216,occupied:false},{id:'S2',x:110,y:216,occupied:true}] }),
  make('v4-sinks-broken-07', '小便器の外にも、先客。', 'Bは故障中、Dは使用中。左下の洗面台にも手洗い中の人。小便器の空きはA・C・E。', ['free','broken','free','occupied','free'], 'left', { handrails: ['A'], sinks: [{id:'S1',x:-30,y:216,occupied:true}] }),
  make('v2-opposite-08', '向こう側にも、選択肢。', '向かい合う2列。Aに先客、右の入口に近いFは手すり付き。どちらの列へ？', [], 'right', { handrails: ['F'], fixtures: [...row(['occupied','free','free']), ...row(['free','free','free'],220,'up').map((f,i)=>({...f,id:String.fromCharCode(68+i)}))] }),
  make('v2-occupied-09', '手前は、使用中です。', '入口に近い手すり付きのAに先客。BとCの間だけ仕切りがある。残る3台から選ぼう。', ['occupied','free','free','free'], 'left', { handrails: ['A'], partitions: [{x:50,y:15,height:88}] }),
  make('v4-sinks-mixed-10', '手洗い中の、ふたり。', '向かいの洗面台は2台とも使用中。小便器はBが使用中、Dが故障中。Cの足元は水濡れ、Eは手すり付き。', ['free','occupied','free','broken','free'], 'right', { handrails: ['E'], wet:[{x:28,y:82,width:55,height:48}], partitions:[{x:146,y:15,height:88}], sinks:[{id:'S1',x:-30,y:216,occupied:true},{id:'S2',x:110,y:216,occupied:true}] }),
  make('v4-sinks-left-11', '洗面台は、左側。', '小便器は3台、真ん中に先客。入口に近い左下の洗面台は空いている。AかC、どちらへ？', [], 'left', { fixtures: paired('.o.'), sinks:[{id:'S1',x:-30,y:216,occupied:false}] }),
  make('v4-sinks-right-12', '洗面台が、右側なら。', 'さっきと同じ3台と先客。今度は空いている洗面台が右下にある。選ぶ場所は変わる？', [], 'left', { fixtures: paired('.o.'), sinks:[{id:'S1',x:110,y:216,occupied:false}] }),
  make('v3-ends-13', '両端は、先約あり。', '5台の両端、AとEに先客。中央の3台から選ぼう。', [], 'bottom', { fixtures: paired('o...o') }),
  make('v4-sinks-busy-14', '洗う人と、使う人。', '小便器はA・C・Eが使用中。右下の洗面台でもひとり手洗い中。BかD、どちらに立つ？', [], 'right', { fixtures: paired('o.o.o'), sinks:[{id:'S1',x:110,y:216,occupied:true}] }),
  make('v3-six-15', '6台、ふたつの列。', '上の列の両端に先客。間のBか、空いている下の列か。', [], 'right', { fixtures: paired('o.o','...'), handrails: ['F'] }),
  make('v3-six-busy-16', '6台中、4台が使用中。', '空きは上のBと下のE。下の列だけ、各台の間に仕切りがある。', [], 'right', { fixtures: paired('o.o','o.o'), partitions: [{x:18,y:166,height:82},{x:82,y:166,height:82}] }),
  make('v3-eight-17', '8台へ、選択肢が広がる。', '上のAとBに先客が並ぶ。上の列の続きか、誰もいない下の列か。', [], 'right', { fixtures: paired('oo..','....'), handrails: ['H'] }),
  make('v3-eight-split-18', '右と左で、空き方が違う。', '上はA・B、下はG・Hが使用中。右の入口からどちらへ？', [], 'right', { fixtures: paired('oo..','..oo') }),
  make('v3-eight-three-19', '残る空きは、3台。', '8台中5台に先客。空きはB・F・H。入口に近いHは手すり付き。', [], 'right', { fixtures: paired('o.oo','o.o.'), handrails: ['H'] }),
  make('v3-eight-two-20', '両列とも、ほぼ満員。', '空きは上のBと下のGだけ。6人の位置を見て、立ち位置を決めよう。', [], 'right', { fixtures: paired('o.oo','oo.o') }),
  make('v3-ten-empty-21', '10台、全部空いている。', '大きなトイレに、先客はゼロ。右の入口に近いJだけ手すり付き。', [], 'right', { fixtures: paired('.....','.....'), handrails: ['J'] }),
  make('v3-ten-two-22', '広い部屋の、真ん中にふたり。', '上のCと下のHが使用中。どちらの列の、どちら側へ？', [], 'right', { fixtures: paired('..o..','..o..'), handrails: ['J'] }),
  make('v3-ten-four-23', '四隅に、先客。', 'A・E・F・Jが使用中。入口は下の中央。両列の内側が空いている。', [], 'bottom', { fixtures: paired('o...o','o...o') }),
  make('v3-ten-six-24', 'ふたつの列、同じ空き方。', 'どちらの列も両端と真ん中が使用中。空きはB・D・G・I。', [], 'right', { fixtures: paired('o.o.o','o.o.o') }),
  make('v3-ten-eight-25', '10台中、8台が使用中。', '残っているのは上のCと下のH。下のHの両側には仕切りがある。', [], 'right', { fixtures: paired('oo.oo','oo.oo'), partitions: [{x:18,y:166,height:82},{x:82,y:166,height:82}] }),
  make('v3-ten-wet-26', '空いている列にも、事情がある。', '上の列は5台とも使用中。下は全部空きだが、入口側のJの足元は濡れている。', [], 'right', { fixtures: paired('ooooo','.....'), handrails: ['J'], wet: [{x:149,y:135,width:50,height:39}] }),
  make('v3-ten-rail-27', '近くの手すり、奥の空間。', '上のD・Eと下のH・Iが使用中。入口そばのJは手すり付き、左側は空いている。', [], 'right', { fixtures: paired('...oo','..oo.'), handrails: ['J'] }),
  make('v3-nine-28', '列の長さが、違う部屋。', '上に5台、下に4台。上のB・Dと下のGが使用中。下のIには手すりがある。', [], 'right', { fixtures: paired('.o.o.','.o..'), handrails: ['I'] }),
  make('v3-seven-29', '7台、故障もふたつ。', '上に3台、下に4台。BとFは故障中、AとGは使用中。空きはC・D・E。', [], 'left', { fixtures: paired('ox.','..xo'), handrails: ['D'] }),
  make('v3-finale-30', '最後の一歩、どこに立つ？', '10台中6台に先客、Dは故障中。空きはB・G・J。Gの足元は水濡れ、Jは手すり付き。', [], 'right', { fixtures: paired('o.oxo','o.oo.'), handrails: ['J'], wet: [{x:-39,y:135,width:50,height:39}], partitions: [{x:146,y:166,height:82}], comments: {B:'30回目の決断。ここまで来ると、立ち位置にも年季が入る。',G:'足元まで見て選んだ？ 最後の一歩にも、物語。',J:'手すり付きでフィニッシュ。今日の立ち位置、おつかれさま。'} }),
];
// Coordinates use a center origin for x; the renderer adds 130 to place them in a 360px room.
export const isSelectable = (q: Question, id: string) => q.fixtures.some(f => f.id === id && f.state === 'free');
