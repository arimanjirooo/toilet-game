import { createClient } from '@supabase/supabase-js';
import { isSelectable, type Question } from './questions';
import type { Counts } from './results';
export type Receipt = { choice: string; votedChoice?: string; counts: Counts; source: 'local' | 'online' | 'unavailable'; saved: boolean; repeated: boolean; persistent: boolean };
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const online = Boolean(url && key);
const client = online ? createClient(url, key) : null;
const memory: Record<string,string> = {};
export async function submitVote(q: Question, choice: string): Promise<Receipt> {
  if (!isSelectable(q,choice)) throw new Error('選べない便器です');
  if (!client) {
    let prior: string | undefined = memory[q.id]; let persistent = true;
    try { prior = localStorage.getItem(`position-v1:${q.id}`) || prior; } catch { persistent = false; }
    if (prior && !isSelectable(q,prior)) prior = undefined;
    const actual = prior || choice;
    memory[q.id] = actual;
    try { localStorage.setItem(`position-v1:${q.id}`,actual); } catch { persistent = false; }
    return { choice, votedChoice: actual, counts: {}, source:'local', saved:true, repeated:Boolean(prior), persistent };
  }
  let saved = false; let votedChoice: string | undefined; let repeated = false;
  try {
    const { data: session, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session.session) { const {error} = await client.auth.signInAnonymously(); if(error) throw error; }
    const {data,error} = await client.rpc('cast_vote',{p_question:q.id,p_choice:choice});
    if(error) throw error;
    votedChoice = data.choice; repeated = !data.inserted; saved = true;
    const result = await client.rpc('vote_counts',{p_question:q.id});
    if(result.error) throw result.error;
    const counts: Counts = Object.fromEntries(result.data.map((r:{choice:string;votes:number})=>[r.choice,Number(r.votes)]));
    return {choice, votedChoice, counts, source:'online',saved,repeated,persistent:true};
  } catch {
    return {choice, votedChoice, counts:{},source:'unavailable',saved,repeated,persistent:true};
  }
}


