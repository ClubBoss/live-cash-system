"use client";

import { useEffect, useMemo, useState } from "react";
import { practicalDecisionById, practicalSkillById, practicalTableStates, type PracticalTableState } from "../content/practical-mastery";
import {
  PRACTICAL_MASTERY_STATE_SCHEMA_VERSION,
  createPracticalMasteryState,
  recordPracticalDecision,
  type PracticalMasteryState,
} from "../lib/practical-mastery-core";

const STORAGE_KEY="live-cash-os:practical-mastery:v3";
type Locale="ru"|"en";

function loadState():PracticalMasteryState{
  if(typeof window==="undefined") return createPracticalMasteryState(new Date(),true);
  try{
    const raw=window.localStorage.getItem(STORAGE_KEY);
    if(!raw) return createPracticalMasteryState(new Date(),true);
    const parsed=JSON.parse(raw) as PracticalMasteryState;
    if(parsed.schemaVersion!==PRACTICAL_MASTERY_STATE_SCHEMA_VERSION||!parsed.skills||!Array.isArray(parsed.attempts)) throw new Error("invalid practical state");
    return parsed;
  }catch{return createPracticalMasteryState(new Date(),true);}
}

function Table({state}:{state:PracticalTableState}){
  const heroSeat=state.seats.find((s)=>s.position===state.hero);
  return <div aria-label="poker table state" style={{margin:"18px auto",maxWidth:720}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8,marginBottom:8}}>
      {state.seats.slice(0,3).map((seat)=><Seat key={seat.position} seat={seat} hero={seat.position===state.hero}/>) }
    </div>
    <div style={{border:"2px solid currentColor",borderRadius:"44%",minHeight:220,padding:22,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>{state.board?.map((card)=><Card key={card} card={card}/>)}</div>
      {state.potBb!==undefined?<p><b>Pot {state.potBb}bb</b></p>:null}
      {state.straddle?<p>Straddle: <b>{state.straddle.position} {state.straddle.amountBb}bb</b></p>:null}
      <div style={{fontSize:14,maxWidth:560}}>{state.actions.map((action)=><div key={action}>{action}</div>)}</div>
      {state.irrelevantCues?.map((cue)=><div key={cue} style={{fontSize:12,opacity:.6,marginTop:4}}>• {cue}</div>)}
      {heroSeat&&state.heroCards?<div style={{marginTop:14}}><b>Hero {state.hero}</b><div style={{display:"flex",gap:6,justifyContent:"center",marginTop:5}}>{state.heroCards.map((card)=><Card key={card} card={card}/>)}</div></div>:null}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8,marginTop:8}}>
      {state.seats.slice(3).map((seat)=><Seat key={seat.position} seat={seat} hero={seat.position===state.hero}/>) }
    </div>
  </div>;
}

function Seat({seat,hero}:{seat:PracticalTableState["seats"][number];hero:boolean}){
  return <div style={{border:"1px solid currentColor",borderRadius:12,padding:"8px 6px",textAlign:"center",opacity:seat.status==="folded"?.45:1,fontWeight:hero?800:500}}>
    <div>{seat.position}{hero?" · HERO":""}</div><div>{seat.stackBb}bb</div>
  </div>;
}

function Card({card}:{card:string}){return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:42,height:56,border:"1px solid currentColor",borderRadius:7,fontWeight:800,background:"var(--surface, white)"}}>{card}</span>}

export default function PracticalPerceptualExperience(){
  const [locale,setLocale]=useState<Locale>("ru");
  const [state,setState]=useState<PracticalMasteryState>(()=>createPracticalMasteryState(new Date(),true));
  const [hydrated,setHydrated]=useState(false);
  const [index,setIndex]=useState(0);
  const [actionId,setActionId]=useState("");
  const [reasonId,setReasonId]=useState("");
  const [revealed,setRevealed]=useState(false);
  const [lastCorrect,setLastCorrect]=useState<boolean|null>(null);

  useEffect(()=>{setState(loadState());setHydrated(true);},[]);
  useEffect(()=>{if(hydrated) window.localStorage.setItem(STORAGE_KEY,JSON.stringify(state));},[state,hydrated]);

  const eligible=useMemo(()=>{
    const attempted=new Set(state.attempts.map((attempt)=>attempt.decisionId));
    const exposed=practicalTableStates.filter((table)=>state.skills[practicalDecisionById.get(table.decisionId)?.skillId??""]?.conceptTaught);
    return [...exposed.filter((table)=>!attempted.has(table.decisionId)),...exposed.filter((table)=>attempted.has(table.decisionId))];
  },[state]);
  const table=eligible[index%Math.max(eligible.length,1)]??null;
  const decision=table?practicalDecisionById.get(table.decisionId)??null:null;
  const skill=decision?practicalSkillById.get(decision.skillId)??null:null;

  const submit=()=>{
    if(!decision||!actionId||!reasonId) return;
    const correct=decision.correctActionId===actionId&&decision.correctReasonId===reasonId;
    setState(recordPracticalDecision(state,{decisionId:decision.id,actionId,reasonId,confidence:65}));
    setLastCorrect(correct);setRevealed(true);
  };
  const next=()=>{setIndex((value)=>value+1);setActionId("");setReasonId("");setRevealed(false);setLastCorrect(null);};

  if(!hydrated) return <main style={{maxWidth:900,margin:"0 auto",padding:24}}><p>Loading…</p></main>;
  if(!table||!decision||!skill) return <main style={{maxWidth:760,margin:"0 auto",padding:"32px 20px 64px"}}>
    <p className="eyebrow">PERCEPTUAL PRACTICE</p>
    <h1>{locale==="ru"?"Сначала познакомься с механизмами":"Learn the mechanisms first"}</h1>
    <p>{locale==="ru"?"Этот режим намеренно не тестирует незнакомые темы. Пройди First Journey, затем сюда попадут уже изученные skills в виде состояния стола.":"This mode intentionally does not test unseen topics. Complete First Journey first; learned skills will then appear here as table states."}</p>
    <a className="primary" href="/mastery/journey">{locale==="ru"?"First Journey →":"First Journey →"}</a>
  </main>;

  return <main style={{maxWidth:900,margin:"0 auto",padding:"24px 18px 64px"}}>
    <section className="hero compact-hero">
      <p className="eyebrow">PERCEPTUAL PRACTICE · {table.scaffold.toUpperCase()}</p>
      <h1>{locale==="ru"?"Прочитай стол до того, как назовёшь тему":"Read the table before naming the topic"}</h1>
      <p>{locale==="ru"?"Никакой подсветки правильной переменной. Найди node сам, затем выбери вывод и причину.":"No highlighting of the correct variable. Extract the node yourself, then choose the conclusion and reason."}</p>
      <div className="mode-switch"><button aria-pressed={locale==="ru"} onClick={()=>setLocale("ru")}>RU</button><button aria-pressed={locale==="en"} onClick={()=>setLocale("en")}>EN</button></div>
    </section>

    <section className="surface" style={{marginTop:18}}>
      <Table state={table}/>
      <h2>{locale==="ru"?decision.questionRu:decision.questionEn}</h2>
      <fieldset style={{border:0,padding:0,margin:"16px 0"}}><legend><b>{locale==="ru"?"Что важно / куда движется решение":"What matters / which way does the decision move"}</b></legend>{decision.actionOptions.map((option)=><label key={option.id} style={{display:"block",padding:"7px 0"}}><input type="radio" name={`${decision.id}-a`} checked={actionId===option.id} disabled={revealed} onChange={()=>setActionId(option.id)}/> {locale==="ru"?option.textRu:option.textEn}</label>)}</fieldset>
      <fieldset style={{border:0,padding:0,margin:"16px 0"}}><legend><b>{locale==="ru"?"Почему":"Why"}</b></legend>{decision.reasonOptions.map((option)=><label key={option.id} style={{display:"block",padding:"7px 0"}}><input type="radio" name={`${decision.id}-r`} checked={reasonId===option.id} disabled={revealed} onChange={()=>setReasonId(option.id)}/> {locale==="ru"?option.textRu:option.textEn}</label>)}</fieldset>
      {!revealed?<button className="primary" disabled={!actionId||!reasonId} onClick={submit}>{locale==="ru"?"Зафиксировать решение":"Commit decision"} <span>→</span></button>:<div className="today-card" style={{marginTop:16}}>
        <p className="eyebrow">REVEAL AFTER COMMITMENT</p>
        <h3>{lastCorrect?(locale==="ru"?"Верно":"Correct"):(locale==="ru"?"Нужен repair":"Repair needed")}</h3>
        <p><b>{locale==="ru"?"Skill:":"Skill:"}</b> {locale==="ru"?skill.titleRu:skill.titleEn}</p>
        <p><b>{locale==="ru"?"Какой cue mattered:":"Cue that mattered:"}</b> {locale==="ru"?table.revealCueRu:table.revealCueEn}</p>
        <p>{locale==="ru"?decision.explanationRu:decision.explanationEn}</p>
        <button className="secondary" onClick={next}>{locale==="ru"?"Следующий стол":"Next table"} <span>→</span></button>
      </div>}
    </section>
  </main>;
}
