import { writeFileSync } from 'node:fs';
import { questions } from '../src/questions';
const quote = (s:string) => `'${s.replaceAll("'", "''")}'`;
writeFileSync('supabase/seed.sql', '-- Generated with npm run seed:sql. No sample votes.\ninsert into public.questions(id,choices) values\n' + questions.map(q=>`(${quote(q.id)},array[${q.fixtures.filter(f=>f.state==='free').map(f=>quote(f.id)).join(',')}])`).join(',\n') + '\non conflict(id) do nothing;\n');
