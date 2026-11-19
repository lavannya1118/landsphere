'use client';
import {useEffect,useState} from 'react';
import Shell from '@/components/Shell';
import {PARCELS,SEED_COMPLAINTS,SEED_APPS,Parcel} from '@/lib/demo';
import {useStore,useRole} from '@/lib/store';
import {configured,db} from '@/lib/firebase';
import {collection,doc,getDocs,updateDoc} from 'firebase/firestore';
import {useLanguage} from '@/lib/language';

type UserRole='citizen'|'officer'|'admin';
type ManagedUser={uid:string;email:string;role:UserRole};
const roles:UserRole[]=['citizen','officer','admin'];
const roleValue=(value:unknown):UserRole=>value==='officer'||value==='admin'?value:'citizen';

export default function Admin(){
 const [parcels,setParcels]=useStore<Parcel[]>('parcels',PARCELS);const [cs]=useStore('complaints',SEED_COMPLAINTS);const [ap]=useStore('apps',SEED_APPS);const [role]=useRole();const {t}=useLanguage();
 const [log,setLog]=useState<any[]>([]);const [nid,setNid]=useState('');const [note,setNote]=useStore<string[]>('notes',[]);const [nt,setNt]=useState('');
 const [users,setUsers]=useState<ManagedUser[]>([]);const [draftRoles,setDraftRoles]=useState<Record<string,UserRole>>({});const [loadingUsers,setLoadingUsers]=useState(false);const [userMessage,setUserMessage]=useState('');const [savingUid,setSavingUid]=useState('');
 useEffect(()=>{setLog(JSON.parse(localStorage.getItem('ls_audit')||'[]'));},[parcels,cs]);
 useEffect(()=>{
  if(role!=='admin'||!configured||!db)return;
  let active=true;setLoadingUsers(true);setUserMessage('');
  getDocs(collection(db,'users')).then(snapshot=>{
   if(!active)return;
   const next=snapshot.docs.map(item=>({uid:item.id,email:String(item.data().email||''),role:roleValue(item.data().role)})).sort((a,b)=>a.email.localeCompare(b.email));
   setUsers(next);setDraftRoles(Object.fromEntries(next.map(user=>[user.uid,user.role])));
  }).catch(error=>{
   console.error('Unable to load user roles.',error);
   if(active)setUserMessage(t('loadUsersError'));
  }).finally(()=>{if(active)setLoadingUsers(false);});
  return()=>{active=false;};
 },[role,t]);
 const saveUserRole=async(user:ManagedUser)=>{
  if(!db)return;
  const nextRole=draftRoles[user.uid]||user.role;
  setSavingUid(user.uid);setUserMessage('');
  try{
   await updateDoc(doc(db,'users',user.uid),{role:nextRole});
   setUsers(current=>current.map(item=>item.uid===user.uid?{...item,role:nextRole}:item));
   setUserMessage(t('roleSaved'));
  }catch(error){
   console.error('Unable to update user role.',error);
   setUserMessage(t('updateRoleError'));
  }finally{setSavingUid('');}
 };
 const add=()=>{if(!nid.trim())return;setParcels([{...PARCELS[0],id:nid.trim(),survey:'000/0',owner:'DEMO Owner (new)',history:['Created by admin (demo)']},...parcels]);setNid('');};
 const N=[['demoParcels',parcels.length],['complaintCount',cs.length],['resolvedCount',cs.filter(c=>c.status==='Resolved').length],['openDisputes',cs.filter(c=>!['Resolved','Rejected'].includes(c.status)).length],['pendingApps',ap.filter(a=>a.status==='Submitted'||a.status==='Under Review').length]] as const;
 return <Shell staffOnly><h1 className="text-2xl font-bold mb-3">{t('adminDashboard')}</h1><div className="grid grid-cols-2 md:grid-cols-5 gap-3">{N.map(([key,value])=><div key={key} className="card"><div className="text-2xl font-bold text-emerald">{value}</div><div className="text-xs">{t(key)}</div></div>)}</div>
 {role==='admin'&&<section className="card mt-4"><h2 className="font-semibold mb-2">{t('manageUsers')}</h2>
  {!configured?<p className="text-sm">{t('firebaseRequired')}</p>:loadingUsers?<p className="text-sm">{t('pleaseWait')}</p>:users.length===0?<p className="text-sm">{t('noUsers')}</p>:<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left opacity-60"><th>{t('userEmail')}</th><th>{t('role')}</th><th></th></tr></thead><tbody>{users.map(user=>{const current=draftRoles[user.uid]||user.role;const isBootstrap=user.email.toLowerCase()==='lavannya1118@gmail.com';return <tr key={user.uid} className="border-t"><td className="py-2 pr-3">{user.email}{isBootstrap&&<span className="ml-2 text-xs text-teal">({t('admin')})</span>}</td><td><select className="inp max-w-[12rem]" value={current} disabled={isBootstrap||savingUid===user.uid} onChange={event=>setDraftRoles({...draftRoles,[user.uid]:roleValue(event.target.value)})}>{roles.map(item=><option key={item} value={item}>{t(item)}</option>)}</select></td><td className="text-right"><button className="btn2" disabled={isBootstrap||savingUid===user.uid||current===user.role} onClick={()=>saveUserRole(user)}>{savingUid===user.uid?t('pleaseWait'):t('saveRole')}</button></td></tr>;})}</tbody></table></div>}
  {userMessage&&<p role="status" className="text-sm text-teal mt-2">{userMessage}</p>}</section>}
 {role==='admin'&&<div className="card mt-4"><h2 className="font-semibold mb-2">{t('manageParcels')}</h2><div className="flex gap-2 mb-2"><input className="inp max-w-xs" placeholder={t('newParcelId')} value={nid} onChange={e=>setNid(e.target.value)}/><button className="btn2" onClick={add}>{t('add')}</button></div>
  <div className="max-h-48 overflow-auto text-sm">{parcels.map(p=><div key={p.id} className="flex justify-between border-t py-1">{p.id}<button className="text-red-600 text-xs" onClick={()=>setParcels(parcels.filter(x=>x.id!==p.id))}>{t('delete')}</button></div>)}</div></div>}
 <div className="card mt-4"><h2 className="font-semibold mb-2">{t('broadcast')}</h2><div className="flex gap-2"><input className="inp" value={nt} onChange={e=>setNt(e.target.value)}/><button className="btn" onClick={()=>{if(nt){setNote([nt,...note]);setNt('');}}}>{t('send')}</button></div>{note.map((n,i)=><div key={i} className="text-xs mt-1">• {n}</div>)}</div>
 <div className="card mt-4"><h2 className="font-semibold mb-2">{t('auditLog')}</h2><div className="max-h-48 overflow-auto text-xs">{log.map((l,i)=><div key={i}>{l.t.slice(0,19)} · {l.role} · {l.action}</div>)}</div></div></Shell>;
}
