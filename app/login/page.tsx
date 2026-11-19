'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import type {User} from 'firebase/auth';
import {doc,Firestore,getDoc,setDoc,updateDoc} from 'firebase/firestore';
import {GoogleAuthProvider,createUserWithEmailAndPassword,getRedirectResult,sendEmailVerification,signInWithEmailAndPassword,signInWithRedirect} from 'firebase/auth';
import {configured,auth,db} from '@/lib/firebase';
import {useLanguage} from '@/lib/language';
import Brand from '@/components/Brand';
import Link from 'next/link';

const ADMIN_EMAIL='lavannya1118@gmail.com';

async function ensureUserProfile(user:User,database:Firestore){
 const userRef=doc(database,'users',user.uid);
 const snapshot=await getDoc(userRef);
 const isBootstrapAdmin=user.email?.toLowerCase()===ADMIN_EMAIL&&user.emailVerified;
 if(!snapshot.exists()){
  await setDoc(userRef,{email:user.email,role:isBootstrapAdmin?'admin':'citizen',createdAt:Date.now()});
  return;
 }
 if(isBootstrapAdmin&&snapshot.data().role!=='admin'){
  await updateDoc(userRef,{email:user.email,role:'admin'});
 }
}

export default function Login(){
 const router=useRouter();const {language,setLanguage,t}=useLanguage();
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [registering,setRegistering]=useState(false);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 useEffect(()=>{
  if(!auth||!db)return;
  let active=true;
  setBusy(true);
  getRedirectResult(auth).then(async credential=>{
   if(!credential)return;
   await ensureUserProfile(credential.user,db);
   if(active)router.replace('/dashboard');
  }).catch(error=>{
   if(active)setMessage(error instanceof Error?error.message:t('googleUnavailable'));
  }).finally(()=>{
   if(active)setBusy(false);
  });
  return ()=>{active=false;};
 },[router,t]);
 const signInWithGoogle=async()=>{
  if(!auth||!db){setMessage(t('googleUnavailable'));return;}
  setBusy(true);setMessage('');
  try{
   const provider=new GoogleAuthProvider();
   provider.setCustomParameters({prompt:'select_account'});
   await signInWithRedirect(auth,provider);
  }catch(error){
   setMessage(error instanceof Error?error.message:t('googleUnavailable'));
  }finally{setBusy(false);}
 };
 const signInWithEmail=async()=>{
  if(!auth||!db){setMessage(t('googleUnavailable'));return;}
  setBusy(true);setMessage('');
  try{
   if(registering){
    const credential=await createUserWithEmailAndPassword(auth,email,password);
    await sendEmailVerification(credential.user);
    await setDoc(doc(db,'users',credential.user.uid),{email:credential.user.email,role:'citizen',createdAt:Date.now()});
    setMessage(t('emailVerify'));
   }else{
    const credential=await signInWithEmailAndPassword(auth,email,password);
    await ensureUserProfile(credential.user,db);
    router.push('/dashboard');
   }
  }catch(error){
   setMessage(error instanceof Error?error.message:t('invalidRequest'));
  }finally{setBusy(false);}
 };
 const resetPassword=async()=>{
  if(!auth){setMessage(t('googleUnavailable'));return;}
  setBusy(true);setMessage('');
  try{
   const {sendPasswordResetEmail}=await import('firebase/auth');
   await sendPasswordResetEmail(auth,email);
   setMessage(t('resetSent'));
  }catch(error){
   setMessage(error instanceof Error?error.message:t('invalidRequest'));
  }finally{setBusy(false);}
 };
 return <div className="relative isolate grid min-h-screen place-items-center overflow-hidden px-4 py-10"><div aria-hidden="true" className="hero-grid absolute inset-0 -z-10 opacity-45"/><div className="w-full max-w-sm">
  <div className="mb-6 flex justify-center"><Brand variant="dark"/></div>
  <div className="card w-full space-y-4">
  <div className="flex justify-end"><label className="sr-only" htmlFor="login-language">{t('language')}</label><select id="login-language" className="inp max-w-[10rem]" value={language} onChange={event=>setLanguage(event.target.value as 'en'|'hi'|'mr')}><option value="en">{t('english')}</option><option value="hi">{t('hindi')}</option><option value="mr">{t('marathi')}</option></select></div>
  <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald">{t('tagline')}</p><h1 className="mt-2 text-2xl font-bold">{registering?t('createAccount'):t('signInTitle')}</h1></div>
  {configured?<><button className="btn w-full justify-center" disabled={busy} onClick={signInWithGoogle}>{t('googleSignIn')}</button>
   <div className="text-center text-xs opacity-60">{t('emailPasswordHelp')}</div>
   <input className="inp" type="email" autoComplete="email" placeholder={t('email')} value={email} onChange={event=>setEmail(event.target.value)}/>
   <input className="inp" type="password" autoComplete={registering?'new-password':'current-password'} placeholder={t('password')} value={password} onChange={event=>setPassword(event.target.value)}/>
   <button className="btn w-full justify-center" disabled={busy} onClick={signInWithEmail}>{busy?t('pleaseWait'):registering?t('register'):t('signIn')}</button>
   <div className="flex justify-between text-xs"><button onClick={()=>setRegistering(!registering)} className="underline">{registering?t('haveAccount'):t('newUser')}</button><button onClick={resetPassword} className="underline">{t('forgotPassword')}</button></div>
  </>:<><p className="text-sm">{t('demoMode')}</p><button className="btn w-full justify-center" onClick={()=>router.push('/dashboard')}>{t('continueCitizen')}</button></>}
  {message&&<p role="status" className="text-sm text-teal break-words">{message}</p>}
  <p className="text-center text-xs text-slate-500 dark:text-sage">{t('demoDisclaimer')}</p>
 </div><p className="mt-5 text-center text-xs"><Link href="/" className="text-emerald hover:underline">{t('home')}</Link></p></div></div>;
}
