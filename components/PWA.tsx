'use client';
import {useEffect,useState} from 'react';
import {useLanguage} from '@/lib/language';
export default function PWA(){
 const {t}=useLanguage();
 const [ev,setEv]=useState<any>(null);
 useEffect(()=>{if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
  const h=(e:any)=>{e.preventDefault();setEv(e);};window.addEventListener('beforeinstallprompt',h);return()=>window.removeEventListener('beforeinstallprompt',h);},[]);
 if(!ev)return null;
 return <button className="btn2 fixed bottom-5 left-5 z-50 shadow-lg" onClick={async()=>{ev.prompt();await ev.userChoice;setEv(null);}}>{t('installApp')}</button>;
}
