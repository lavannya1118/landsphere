import {initializeApp,getApps} from 'firebase/app';
import {connectAuthEmulator,getAuth} from 'firebase/auth';
import {connectFirestoreEmulator,getFirestore} from 'firebase/firestore';
import {connectStorageEmulator,getStorage} from 'firebase/storage';
const emulatorMode=process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS==='true';
const cfg={apiKey:process.env.NEXT_PUBLIC_FIREBASE_API_KEY,authDomain:process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,storageBucket:process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,appId:process.env.NEXT_PUBLIC_FIREBASE_APP_ID};
export const configured=emulatorMode||Object.values(cfg).every(value=>typeof value==='string'&&value.length>0);
if(emulatorMode){
 cfg.apiKey||= 'demo-api-key';
 cfg.authDomain||= 'localhost';
 cfg.projectId||= 'demo-landsphere';
 cfg.storageBucket||= 'demo-landsphere.appspot.com';
 cfg.appId||= '1:123:web:demo';
}
export const app=configured?(getApps()[0]||initializeApp(cfg)):null;
export const auth=app?getAuth(app):null;
export const db=app?getFirestore(app):null;
export const storage=app?getStorage(app):null;
const emulatorState=globalThis as typeof globalThis & {__landSphereEmulatorsConnected?:boolean};
if(emulatorMode&&typeof window!=='undefined'&&auth&&db&&storage&&!emulatorState.__landSphereEmulatorsConnected){
 connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});
 connectFirestoreEmulator(db,'127.0.0.1',8085);
 connectStorageEmulator(storage,'127.0.0.1',9199);
 emulatorState.__landSphereEmulatorsConnected=true;
}
