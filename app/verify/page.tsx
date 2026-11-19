'use client';
import {useEffect,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Suspense} from 'react';
import {useLanguage} from '@/lib/language';
function V(){const id=useSearchParams().get('id')||'';const [r,setR]=useState<any>(null);const {t}=useLanguage();useEffect(()=>{const s=localStorage.getItem('ls_rpt_'+id);setR(s?JSON.parse(s):false);},[id]);
 const issued=t('reportIssued').replace('{id}',id).replace('{date}',r?.t||'');
 return <div className="min-h-screen grid place-items-center p-4"><div className="card max-w-md"><h1 className="font-bold">{t('verifyReport')}</h1>{r===null?t('checking'):r?<p className="text-sm mt-2">{issued} {t('notLegalDocument')}</p>:<p className="text-sm mt-2">{t('noMatchingReport')}</p>}</div></div>;}
export default function Page(){return <Suspense><V/></Suspense>;}
