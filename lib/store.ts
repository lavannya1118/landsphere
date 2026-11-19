'use client';
import {useEffect,useState} from 'react';
import {onAuthStateChanged} from 'firebase/auth';
import {doc,onSnapshot} from 'firebase/firestore';
import {auth,configured,db} from '@/lib/firebase';
export function useStore<T>(key:string,seed:T):[T,(v:T)=>void]{
 const [v,setV]=useState<T>(seed);
 useEffect(()=>{try{const s=localStorage.getItem('ls_'+key);if(s)setV(JSON.parse(s));}catch{}},[key]);
 const set=(n:T)=>{setV(n);try{localStorage.setItem('ls_'+key,JSON.stringify(n));}catch{}};
 return [v,set];
}
export function audit(action:string){try{const k='ls_audit';const a=JSON.parse(localStorage.getItem(k)||'[]');a.unshift({t:new Date().toISOString(),role:localStorage.getItem('ls_role')||'guest',action});localStorage.setItem(k,JSON.stringify(a.slice(0,200)));}catch{}}
export function useRole():[string]{
 const [r,setR]=useState('guest');
 useEffect(()=>{
  if(!configured||!auth||!db){setR('citizen');return;}
  let stopProfile=()=>{};
  const stopAuth=onAuthStateChanged(auth,user=>{
   stopProfile();
   if(!user){setR('guest');return;}
   stopProfile=onSnapshot(doc(db,'users',user.uid),snapshot=>{
    setR(snapshot.data()?.role||'citizen');
   },error=>{
    console.error('Unable to load the signed-in user role.',error);
    setR('citizen');
   });
  });
  return()=>{stopAuth();stopProfile();};
 },[]);
 return [r];
}
