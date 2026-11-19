'use client';
import {useState} from 'react';
import Shell from '@/components/Shell';
import {PARCELS,SEED_APPS} from '@/lib/demo';
import {useStore,useRole,audit} from '@/lib/store';
import {MessageKey,useLanguage} from '@/lib/language';
const S=['Submitted','Under Review','Approved','Rejected'];
const typeKeys:Record<string,MessageKey>={'Certified extract':'certifiedExtract','Mutation request':'mutationRequest','Boundary survey':'boundarySurvey'};
const stageKeys:Record<string,MessageKey>={Submitted:'stageSubmitted','Under Review':'stageReview',Approved:'stageApproved',Rejected:'stageRejected'};
export default function Apps(){
 const {t}=useLanguage();const [list,setList]=useStore('apps',SEED_APPS);const [role]=useRole();const [type,setType]=useState('Certified extract');const [p,setP]=useState(PARCELS[0].id);
 const add=()=>{const id='APP-DEMO-'+String(list.length+1).padStart(3,'0');setList([{id,type,parcel:p,status:'Submitted',date:new Date().toISOString().slice(0,10)},...list]);audit('Application '+id);};
 return <Shell><h1 className="text-2xl font-bold mb-3">{t('applicationTracking')}</h1><div className="card flex gap-2 flex-wrap mb-4"><select className="inp max-w-[12rem]" value={type} onChange={e=>setType(e.target.value)}>{['Certified extract','Mutation request','Boundary survey'].map(item=><option key={item} value={item}>{t(typeKeys[item])}</option>)}</select><select className="inp max-w-[12rem]" value={p} onChange={e=>setP(e.target.value)}>{PARCELS.map(x=><option key={x.id}>{x.id}</option>)}</select><button className="btn2" onClick={add}>{t('apply')}</button></div>
 {list.map(a=><div key={a.id} className="card mb-2 text-sm flex justify-between flex-wrap gap-2"><span><b>{a.id}</b> · {t(typeKeys[a.type]||'certifiedExtract')} · {a.parcel} · {a.date}</span>{role==='admin'||role==='officer'?<select className="inp max-w-[10rem]" value={a.status} onChange={e=>{setList(list.map(x=>x.id===a.id?{...x,status:e.target.value}:x));audit(a.id+' → '+e.target.value);}}>{S.map(stage=><option key={stage} value={stage}>{t(stageKeys[stage])}</option>)}</select>:<span className="px-2 rounded-full bg-emerald/20">{t(stageKeys[a.status]||'stageSubmitted')}</span>}</div>)}</Shell>;
}
