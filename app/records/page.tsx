'use client';
import {useState} from 'react';
import Shell from '@/components/Shell';
import {PARCELS} from '@/lib/demo';
import {useStore,audit} from '@/lib/store';
import {useLanguage} from '@/lib/language';
type Doc={id:string;parcel:string;name:string;text:string;data:string;status:string};
export default function Records(){
 const {t}=useLanguage();const [q,setQ]=useState('');const [sort,setSort]=useState('id');const [docs,setDocs]=useStore<Doc[]>('docs',[]);const [par,setPar]=useState(PARCELS[0].id);const [msg,setMsg]=useState('');
 const rows=PARCELS.filter(p=>[p.id,p.village,p.survey,p.use].join(' ').toLowerCase().includes(q.toLowerCase())).sort((a,b)=>sort==='area'?b.areaAcres-a.areaAcres:a[sort as 'id'].localeCompare(b[sort as 'id']));
 const up=async(f?:File)=>{if(!f)return;if(f.size>5e6)return setMsg(t('maxFile'));setMsg(t('readingFile'));
  const data=await new Promise<string>(r=>{const x=new FileReader();x.onload=()=>r(x.result as string);x.readAsDataURL(f);});let text='';
  if(f.type.startsWith('image/')){try{const T=await import('tesseract.js');setMsg(t('runningOcr'));text=(await T.recognize(f,'eng')).data.text;}catch(error){console.error('OCR processing failed.',error);text='OCR failed.';}}
  setDocs([{id:'DOC-'+Date.now(),parcel:par,name:f.name,text,data,status:'Not verified'},...docs]);audit('Uploaded '+f.name);setMsg(t('savedDemo'));};
 return <Shell><h1 className="text-2xl font-bold mb-3">{t('records')}</h1>
 <div className="flex gap-2 mb-3 flex-wrap"><input className="inp max-w-xs" placeholder={t('searchRecords')} value={q} onChange={e=>setQ(e.target.value)}/><select className="inp max-w-[10rem]" value={sort} onChange={e=>setSort(e.target.value)}><option value="id">{t('sortId')}</option><option value="village">{t('sortVillage')}</option><option value="area">{t('sortArea')}</option></select></div>
 <div className="card overflow-x-auto mb-4"><table className="w-full text-sm"><thead><tr className="text-left opacity-60"><th>{t('id')}</th><th>{t('survey')}</th><th>{t('village')}</th><th>{t('use')}</th><th>{t('acres')}</th><th>{t('status')}</th></tr></thead><tbody>{rows.map(p=><tr key={p.id} className="border-t"><td>{p.id}</td><td>{p.survey}</td><td>{p.village}</td><td>{p.use}</td><td>{p.areaAcres}</td><td>{p.status}</td></tr>)}</tbody></table></div>
 <div className="card space-y-2"><h2 className="font-semibold">{t('documentsOcr')}</h2><div className="flex gap-2 flex-wrap"><select className="inp max-w-[12rem]" value={par} onChange={e=>setPar(e.target.value)}>{PARCELS.map(p=><option key={p.id}>{p.id}</option>)}</select><input type="file" accept="image/*,application/pdf" onChange={e=>up(e.target.files?.[0])}/></div><p className="text-xs text-teal">{msg}</p>
 {docs.map(d=><div key={d.id} className="border rounded-xl p-3 text-sm"><b>{d.name}</b> · {d.parcel} · {d.status}<div className="flex gap-3 text-xs mt-1"><a className="underline" href={d.data} download={d.name}>{t('download')}</a>{d.data.startsWith('data:application/pdf')&&<a className="underline" href={d.data} target="_blank">{t('previewPdf')}</a>}<button className="underline" onClick={()=>setDocs(docs.filter(x=>x.id!==d.id))}>{t('delete')}</button></div>{d.text&&<pre className="whitespace-pre-wrap text-xs mt-2 opacity-70 max-h-32 overflow-auto">{d.text}</pre>}</div>)}</div></Shell>;
}
