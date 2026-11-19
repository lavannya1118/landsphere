'use client';
import Shell from '@/components/Shell';
import {ChatBody} from '@/components/Chat';
import {useLanguage} from '@/lib/language';
export default function Assistant(){
 const {language}=useLanguage();
 return <Shell><div className="card h-[70vh] overflow-hidden p-0"><ChatBody lang={language} key={language}/></div></Shell>;
}
