'use client';
import dynamic from 'next/dynamic';
import {useEffect,useMemo,useState} from 'react';
import Shell from '@/components/Shell';
import {PARCELS,Parcel} from '@/lib/demo';
import {useStore,audit} from '@/lib/store';
import {MessageKey,useLanguage} from '@/lib/language';
const MapView=dynamic(()=>import('@/components/MapView'),{ssr:false,loading:()=><div className="card">Loading map…</div>});
const landUseKeys:Record<string,MessageKey>={Agricultural:'agricultural',Residential:'residential',Commercial:'commercial',Forest:'forest',Industrial:'industrial'};
const area=(p:Parcel)=>{const [a,b,c]=[p.coords[0],p.coords[1],p.coords[2]];const R=111320;return Math.round(Math.abs(b[0]-a[0])*R*Math.cos(a[1]*Math.PI/180)*Math.abs(c[1]-b[1])*R);};
export default function Explorer(){
 const {t}=useLanguage();
 const [q,setQ]=useState('');const [use,setUse]=useState('');const [sel,setSel]=useState<Parcel>();const [fav,setFav]=useStore<string[]>('fav',[]);
 useEffect(()=>{const initialQuery=new URLSearchParams(window.location.search).get('q');if(initialQuery)setQ(initialQuery);},[]);
 const list=useMemo(()=>PARCELS.filter(p=>(!use||p.use===use)&&[p.id,p.village,p.district,p.survey].join(' ').toLowerCase().includes(q.toLowerCase())),[q,use]);
 const locate=()=>navigator.geolocation?.getCurrentPosition(p=>alert(`${t('approxPosition')}: ${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`),()=>alert(t('locationDenied')));
 return <Shell><h1 className="text-2xl font-bold mb-3">{t('explorer')}</h1>
 <div className="flex flex-wrap gap-2 mb-3"><input className="inp max-w-xs" placeholder={t('searchParcel')} value={q} onChange={e=>setQ(e.target.value)}/>
  <select className="inp max-w-[11rem]" value={use} onChange={e=>setUse(e.target.value)}><option value="">{t('allLandUse')}</option>{[...new Set(PARCELS.map(p=>p.use))].map(u=><option key={u} value={u}>{t(landUseKeys[u])}</option>)}</select><button className="btn" onClick={locate}>{t('gpsLocate')}</button><span className="text-sm self-center">{list.length} {t('parcels')}</span></div>
 <div className="grid lg:grid-cols-3 gap-4"><div className="lg:col-span-2"><MapView parcels={list} selected={sel?.id} onSelect={p=>{setSel(p);audit('Viewed '+p.id);}}/></div>
 <div className="card text-sm space-y-1">{sel?<><h2 className="font-bold text-lg">{sel.id}</h2>
  {([[t('surveyNo'),sel.survey],[t('village'),sel.village],[t('district'),sel.district],[t('recordArea'),`${sel.areaAcres} acres`],[t('measuredArea'),`${area(sel)} m²`],[t('landUse'),t(landUseKeys[sel.use])],[t('ownershipDemo'),sel.owner],[t('verification'),sel.status],[t('boundary'),'4-point polygon (demo GeoJSON)']] as const).map(([k,v])=><div key={k} className="flex justify-between gap-2"><span className="opacity-60">{k}</span><span>{v}</span></div>)}
  <h3 className="font-semibold pt-2">{t('recordHistory')}</h3>{sel.history.map(h=><div key={h} className="text-xs">{h}</div>)}
  <button className="btn2 mt-2" onClick={()=>setFav(fav.includes(sel.id)?fav.filter(x=>x!==sel.id):[...fav,sel.id])}>{fav.includes(sel.id)?t('saved'):t('saveParcel')}</button></>:<p>{t('selectParcel')}</p>}</div></div></Shell>;
}
