import { test } from 'node:test';
import assert from 'node:assert/strict';
import { judge } from '../src/results';
import { questions, isSelectable } from '../src/questions';
test('threshold, unique majority, tied majority and minority',()=>{
 assert.equal(judge({},'A').status,'pending');
 assert.equal(judge({A:29},'A').status,'pending');
 assert.equal(judge({A:20,B:10},'A').status,'majority');
 assert.equal(judge({A:15,B:15},'B').status,'tie');
 assert.equal(judge({A:14,B:14,C:2},'C').status,'minority');
 assert.equal(judge({A:20,B:10},'B').status,'minority');
});
test('question IDs are unique and every layout offers valid choices',()=>{
 assert.equal(questions.length,30);
 assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
 for(const q of questions){
  assert.ok(q.fixtures.filter(f=>f.state==='free').length>=2);
  assert.equal(new Set(q.fixtures.map(f=>f.id)).size,q.fixtures.length);
  for(const sink of q.sinks) assert.equal(isSelectable(q,sink.id),false);
  for(const f of q.fixtures){assert.equal(isSelectable(q,f.id),f.state==='free');assert.ok(f.x+130>=25 && f.x+130<=335);}
 }
});
import { voteBreakdown } from '../src/vote-breakdown';
test('per-question tally shows real votes below threshold and hides unavailable counts',()=>{
 const receipt = {choice:'A',counts:{A:2,B:1},source:'online' as const,saved:true,repeated:false,persistent:true};
 const tally = voteBreakdown(questions[0],receipt);
 assert.match(tally,/合計 <b>3票/);
 assert.match(tally,/2票 <small>\(67%\)/);
 assert.match(tally,/30票までは多数派の判定を保留/);
 for(const source of ['local','unavailable'] as const){
  const pending = voteBreakdown(questions[0],{...receipt,source});
  assert.match(pending,/票数未取得/);
  assert.doesNotMatch(pending,/\d+票|\d+%/);
 }
});


