import {test,expect} from '@playwright/test';
import {questions} from '../../src/questions';
test('all questions, blocked fixtures, local results, replay persistence',async({page},info)=>{
 test.setTimeout(90000);
 const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'空いている。 なのに、迷う。'})).toBeVisible();
 await page.screenshot({path:`test-results/${info.project.name}-home.png`,fullPage:true});
 await page.getByRole('button',{name:'立ち位置を決める'}).click();
 for(let i=0;i<questions.length;i++){
  await expect(page.locator('.question-top')).toContainText(String(i+1).padStart(2,'0'));
  if(i===1) await expect(page.getByRole('button',{name:'A 手すり付き 空き・選択する'})).toBeEnabled();
  await expect(page.locator('.sink')).toHaveCount(questions[i].sinks.length);
  await expect(page.locator('[data-choice]')).toHaveCount(questions[i].fixtures.length);
  const unavailable=page.locator('.fixture.occupied,.fixture.broken');
  for(const b of await unavailable.all()) await expect(b).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(i===0 || i===1 || i===7 || i===8 || i===9 || i===5 || i===11 || i===13 || i===24 || i===29) await page.screenshot({path:`test-results/${info.project.name}-q${i+1}.png`,fullPage:true});
  await page.locator('.fixture.free').first().click();
  await expect(page.locator('.result')).toContainText('集計中');
  await expect(page.locator('.result')).toContainText('みんなの投票は未接続');
  await expect(page.locator('.bars')).toHaveCount(0);
  await expect(page.getByRole('region',{name:'この問題の投票結果'})).toContainText('票数未取得');
  if(i===0) await page.screenshot({path: 'test-results/' + info.project.name + '-answer.png',fullPage:true});
  await page.getByRole('button',{name:i===questions.length-1?'最終結果を見る':'次のトイレへ'}).click();
 }
 await expect(page.locator('.score')).toContainText(`${questions.length}問は判定保留`);
 await expect(page.locator('.vote-breakdown')).toHaveCount(0);
 await page.screenshot({path:`test-results/${info.project.name}-final.png`,fullPage:true});
 await page.getByRole('button',{name:'もう一度プレイ'}).click();
 await page.locator('.fixture.free').last().click();
 await expect(page.locator('.result')).toContainText('YOUR CHOICE — D');
 await expect(page.locator('.notice')).toContainText('追加投票なし');
 await expect(page.locator('.fixture.selected')).toHaveAttribute('data-choice','D');
 expect(await page.evaluate(()=>localStorage.getItem('position-v1:v2-empty-01'))).toBe('A');
 await page.reload();
 await page.getByRole('button',{name:'立ち位置を決める'}).click();
 await page.locator('.fixture.free').last().click();
 await expect(page.locator('.result')).toContainText('YOUR CHOICE — D');
 await expect(page.locator('.fixture.selected')).toHaveAttribute('data-choice','D');
 expect(await page.evaluate(()=>localStorage.getItem('position-v1:v2-empty-01'))).toBe('A');
 await page.getByRole('button',{name:'次のトイレへ'}).click();
 for(let i=1;i<questions.length;i++){
  await page.locator('.fixture.free').last().click();
  await page.getByRole('button',{name:i===questions.length-1?'最終結果を見る':'次のトイレへ'}).click();
 }
 await expect(page.locator('.recap>div').first().locator('b')).toHaveText('D');
 expect(errors).toEqual([]);
});





