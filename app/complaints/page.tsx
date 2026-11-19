'use client';
import {useState} from 'react';
import Shell from '@/components/Shell';
import {CATS,PARCELS,SEED_COMPLAINTS,STAGES} from '@/lib/demo';
import {useStore,useRole,audit} from '@/lib/store';
import {MessageKey,useLanguage} from '@/lib/language';
const categoryKeys:Record<string,MessageKey>={'Land boundary dispute':'catBoundary','Illegal encroachment':'catEncroachment','Incorrect land record':'catIncorrect','Land-use violation':'catViolation','Ownership record discrepancy':'catOwnership',Other:'catOther'};
const stageKeys:Record<string,MessageKey>={Submitted:'stageSubmitted','Under Review':'stageReview',Assigned:'stageAssigned',Investigation:'stageInvestigation',Resolved:'stageResolved',Rejected:'stageRejected'};
export default function Complaints(){
 const {t}=useLanguage();const [list,setList]=useStore('complaints',SEED_COMPLAINTS);const [role]=useRole();const [f,setF]=useState({cat:CATS[0],desc:'',parcel:PARCELS[0].id,loc:''});const [err,setErr]=useState('');
 const staff=role==='admin'||role==='officer';
 const submit=()=>{if(f.desc.trim().length<10)return setErr(t('describeIssue'));setErr('');const id='CMP-DEMO-'+String(list.length+1).padStart(3,'0');setList([{id,cat:f.cat,desc:f.desc,parcel:f.parcel,status:'Submitted',official:'Unassigned',date:new Date().toISOString().slice(0,10),district:'Pune'},...list]);audit('Complaint '+id);setF({...f,desc:''});};
 const upd=(id:string,k:string,v:string)=>{setList(list.map(c=>c.id===id?{...c,[k]:v}:c));audit(`${id} ${k}=${v}`);};
 return <Shell><h1 className="text-2xl font-bold mb-3">{t('complaints')}</h1>
 <div className="card grid md:grid-cols-2 gap-2 mb-4"><select className="inp" value={f.cat} onChange={e=>setF({...f,cat:e.target.value})}>{CATS.map(category=><option key={category} value={category}>{t(categoryKeys[category])}</option>)}</select><select className="inp" value={f.parcel} onChange={e=>setF({...f,parcel:e.target.value})}>{PARCELS.map(p=><option key={p.id}>{p.id}</option>)}</select>
  <input className="inp md:col-span-2" placeholder={t('location')} value={f.loc} onChange={e=>setF({...f,loc:e.target.value})}/><textarea className="inp md:col-span-2" rows={3} placeholder={t('description')} value={f.desc} onChange={e=>setF({...f,desc:e.target.value})}/>
  <button className="btn2 w-fit" onClick={submit}>{t('submitComplaint')}</button><span className="text-sm text-red-600">{err}</span></div>
 <div className="space-y-2">{list.map(c=><div key={c.id} className="card text-sm"><div className="flex justify-between flex-wrap gap-2"><b>{c.id}</b><span>{c.date}</span></div><div>{t(categoryKeys[c.cat]||'catOther')} · {c.parcel}</div><div className="opacity-70">{c.desc}</div>
  <div className="flex gap-1 mt-2 flex-wrap">{STAGES.map(stage=><span key={stage} className={`px-2 py-0.5 rounded-full text-xs ${stage===c.status?'bg-emerald text-white':'bg-slate-100 dark:bg-slate-800'}`}>{t(stageKeys[stage])}</span>)}</div>
  <div className="mt-2 text-xs">{t('official')}: {c.official}</div>
  {staff&&<div className="flex gap-2 mt-2"><select className="inp max-w-[11rem]" value={c.status} onChange={e=>upd(c.id,'status',e.target.value)}>{STAGES.map(stage=><option key={stage} value={stage}>{t(stageKeys[stage])}</option>)}</select><select className="inp max-w-[11rem]" value={c.official} onChange={e=>upd(c.id,'official',e.target.value)}>{['Unassigned','Officer Demo A','Officer Demo B'].map(item=><option key={item} value={item}>{item==='Unassigned'?t('unassigned'):item}</option>)}</select></div>}</div>)}</div></Shell>;
}
