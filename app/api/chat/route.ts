import {NextResponse} from 'next/server';
import {PARCELS} from '@/lib/demo';
import type {Language} from '@/lib/language';

type ChatMessage={r:'user'|'ai';t:string};
type ChatRequest={messages:ChatMessage[];lang:Language};
const MAX_MESSAGES=12;
const MAX_MESSAGE_LENGTH=4000;
const fallbackText:Record<Language,{needsKey:string;unavailable:string;invalid:string;terms:Record<string,string>;notFound:string;matches:(count:number,records:string)=>string}> = {
 en:{
  needsKey:'General AI chat is not configured. Add the server-side Gemini API key in Vercel. Demo parcel lookup is still available.',
  unavailable:'The AI service is temporarily unavailable. Please try again later.',
  invalid:'Please enter a message and try again.',
  terms:{
   '7/12':'A 7/12 extract (Satbara) is a Maharashtra land record. This app can explain the term, but its sample records are fictional and not official.',
   mutation:'Mutation updates a land record after a transfer, inheritance or sale. It does not by itself decide legal title.',
   survey:'A survey number identifies a parcel in land records.',
   encroachment:'Encroachment is unauthorised occupation of land belonging to someone else or to the public.'
  },
  notFound:'I could not find a matching parcel in the demo data. General AI responses need the Gemini API key to be configured.',
  matches:(count,records)=>`I found ${count} matching demo parcel(s): ${records}. These are fictional records, not official data.`
 },
 hi:{
  needsKey:'सामान्य AI चैट कॉन्फ़िगर नहीं है। Vercel में सर्वर-साइड Gemini API key जोड़ें। डेमो भूखंड खोज उपलब्ध है।',
  unavailable:'AI सेवा अभी उपलब्ध नहीं है। कृपया बाद में फिर कोशिश करें.',
  invalid:'कृपया संदेश लिखें और फिर कोशिश करें।',
  terms:{
   '7/12':'7/12 (सातबारा) महाराष्ट्र का भूमि रिकॉर्ड है। यह ऐप इस शब्द का अर्थ समझा सकता है, लेकिन यहाँ के नमूना रिकॉर्ड काल्पनिक और गैर-आधिकारिक हैं।',
   mutation:'नामांतरण बिक्री, विरासत या हस्तांतरण के बाद भूमि रिकॉर्ड में बदलाव दर्ज करता है। इससे अपने-आप कानूनी स्वामित्व तय नहीं होता।',
   survey:'सर्वे नंबर भूमि रिकॉर्ड में किसी भूखंड की पहचान करता है।',
   encroachment:'अतिक्रमण का अर्थ किसी दूसरे व्यक्ति या सार्वजनिक भूमि पर अनधिकृत कब्ज़ा है।'
  },
  notFound:'डेमो डेटा में मेल खाता भूखंड नहीं मिला। सामान्य AI उत्तरों के लिए Gemini API key कॉन्फ़िगर करनी होगी।',
  matches:(count,records)=>`${count} मेल खाते डेमो भूखंड मिले: ${records}। ये काल्पनिक रिकॉर्ड हैं, आधिकारिक डेटा नहीं।`
 },
 mr:{
  needsKey:'सामान्य AI चॅट कॉन्फिगर केलेले नाही. Vercel मध्ये सर्व्हर-साइड Gemini API key जोडा. डेमो भूखंड शोध उपलब्ध आहे.',
  unavailable:'AI सेवा सध्या उपलब्ध नाही. कृपया नंतर पुन्हा प्रयत्न करा.',
  invalid:'कृपया संदेश लिहा आणि पुन्हा प्रयत्न करा.',
  terms:{
   '7/12':'7/12 (सातबारा) हा महाराष्ट्रातील जमीन अभिलेख आहे. हे अॅप त्याचा अर्थ समजावू शकते; मात्र नमुना नोंदी काल्पनिक आणि अधिकृत नाहीत.',
   mutation:'फेरफार म्हणजे विक्री, वारसा किंवा हस्तांतरणानंतर जमीन नोंदीत बदल नोंदवणे. यामुळे स्वतःहून कायदेशीर मालकी ठरत नाही.',
   survey:'सर्वे क्रमांक जमीन नोंदीतील भूखंडाची ओळख दर्शवतो.',
   encroachment:'अतिक्रमण म्हणजे दुसऱ्याच्या किंवा सार्वजनिक जमिनीवर अनधिकृत कब्जा.'
  },
  notFound:'डेमो डेटामध्ये जुळणारा भूखंड सापडला नाही. सामान्य AI उत्तरांसाठी Gemini API key कॉन्फिगर करावी लागेल.',
  matches:(count,records)=>`${count} जुळणारे डेमो भूखंड सापडले: ${records}. या काल्पनिक नोंदी आहेत, अधिकृत डेटा नाही.`
 }
};

function isChatMessage(value:unknown):value is ChatMessage{
 if(!value||typeof value!=='object')return false;
 const message=value as Record<string,unknown>;
 return (message.r==='user'||message.r==='ai')&&typeof message.t==='string'&&message.t.trim().length>0&&message.t.length<=MAX_MESSAGE_LENGTH;
}
function isChatRequest(value:unknown):value is ChatRequest{
 if(!value||typeof value!=='object')return false;
 const request=value as Record<string,unknown>;
 return Array.isArray(request.messages)
  &&request.messages.length>0
  &&request.messages.length<=MAX_MESSAGES
  &&request.messages.every(isChatMessage)
  &&request.messages[request.messages.length-1].r==='user'
  &&(request.lang==='en'||request.lang==='hi'||request.lang==='mr');
}
function localAnswer(question:string,lang:Language){
 const s=question.toLowerCase();const text=fallbackText[lang];
 const aliases:{keys:string[];term:keyof typeof text.terms}[]=[
  {keys:['7/12','7-12','सातबारा','७/१२'],term:'7/12'},
  {keys:['mutation','नामांतरण','फेरफार'],term:'mutation'},
  {keys:['survey','सर्वे'],term:'survey'},
  {keys:['encroachment','अतिक्रमण'],term:'encroachment'}
 ];
 const glossary=aliases.find(item=>item.keys.some(key=>s.includes(key)));
 if(glossary)return text.terms[glossary.term];
 const aliasesByVillage:Record<string,string[]>={Shirur:['शिरूर','शिरुर'],Baramati:['बारामती'],Niphad:['निफाड'],Sinnar:['सिन्नर'],Dindori:['दिंडोरी'],Indapur:['इंदापूर'],Daund:['दौंड'],Satara:['सातारा'],Karad:['कराड'],Kolhapur:['कोल्हापूर']};
 const matches=PARCELS.filter(parcel=>{
  const values=[parcel.id,parcel.village,parcel.district,parcel.use].map(value=>value.toLowerCase());
  const locationAliases=aliasesByVillage[parcel.village]||[];
  return values.some(value=>s.includes(value))||locationAliases.some(alias=>s.includes(alias));
 });
 if(matches.length){
  const records=matches.slice(0,6).map(parcel=>`${parcel.id} (${parcel.village}, ${parcel.use}, ${parcel.areaAcres} acres)`).join('; ');
  return text.matches(matches.length,records);
 }
 return text.notFound;
}

function extractGeminiReply(data:unknown):string|null{
 if(!data||typeof data!=='object'||!('candidates' in data)||!Array.isArray(data.candidates))return null;
 const parts=data.candidates.flatMap(candidate=>{
  if(!candidate||typeof candidate!=='object'||!('content' in candidate)||!candidate.content||typeof candidate.content!=='object'||!('parts' in candidate.content)||!Array.isArray(candidate.content.parts))return [];
  return candidate.content.parts.flatMap(part=>{
   if(!part||typeof part!=='object'||!('text' in part)||typeof part.text!=='string')return [];
   return [part.text];
  });
 });
 const reply=parts.join('').trim();
 return reply||null;
}

export async function POST(request:Request){
 let input:unknown;
 try{input=await request.json();}catch{return NextResponse.json({error:fallbackText.en.invalid},{status:400});}
 if(!isChatRequest(input)){
  const language=input&&typeof input==='object'&&'lang' in input&&(input.lang==='hi'||input.lang==='mr')?input.lang:'en';
  return NextResponse.json({error:fallbackText[language].invalid},{status:400});
 }
 const {messages,lang}=input;const last=messages[messages.length-1].t;
 const apiKey=process.env.GEMINI_API_KEY;
 if(!apiKey)return NextResponse.json({reply:localAnswer(last,lang)});
 const context=PARCELS.map(parcel=>`${parcel.id}|${parcel.village}|${parcel.district}|${parcel.use}|${parcel.areaAcres}ac|${parcel.status}`).join('\n');
 try{
  const model=process.env.GEMINI_MODEL||'gemini-3.8-flash';
  const models=[...new Set([model,'gemini-3.6-flash','gemini-3.5-flash-lite'])];
  const body=JSON.stringify({
    systemInstruction:{parts:[{text:`You are the friendly, conversational assistant for LandSphere. Help with general questions as well as land topics. Respond to what the person actually asked, use recent conversation context, and avoid restarting with a greeting every turn. Be warm and clear without being overly formal. Give a direct answer first; ask one brief clarifying question only when it is genuinely needed. Use short paragraphs or simple numbered steps when helpful. Reply in the language of the latest user message when it is clearly English, Hindi, or Marathi; otherwise use ${lang==='hi'?'Hindi':lang==='mr'?'Marathi':'English'}.\n\nFor LandSphere records, use only the fictional demo data below. Never invent an owner, status, or official verification; say when the demo has no matching fact and remind users that these are not government records. Do not make legal decisions or present answers as legal advice.\n\n${context}`}]},
    contents:messages.slice(messages.findIndex(message=>message.r==='user')).map(message=>({
     role:message.r==='ai'?'model':'user',
     parts:[{text:message.t}]
    })),
    generationConfig:{maxOutputTokens:900,temperature:0.7}
  });
  let response:Response|null=null;
  for(let attempt=0;attempt<models.length;attempt++){
   try{
    response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${models[attempt]}:generateContent`,{
     method:'POST',
     headers:{'x-goog-api-key':apiKey,'content-type':'application/json'},
     signal:AbortSignal.timeout(10_000),
     body
    });
   }catch(error){
    if(attempt===models.length-1)throw error;
    console.warn('Gemini API request failed; trying the fallback model.',error);
    continue;
   }
   if(response.ok)break;
   if((response.status===429||response.status>=500)&&attempt<models.length-1){
    console.warn('Gemini API returned a transient status; trying the fallback model.',response.status);
    await response.body?.cancel();
    continue;
   }
   console.error('Gemini API returned an unsuccessful status.',response.status);
   return NextResponse.json({error:fallbackText[lang].unavailable},{status:502});
  }
  if(!response?.ok){
   console.error('Gemini API remained unavailable after a retry.');
   return NextResponse.json({error:fallbackText[lang].unavailable},{status:502});
  }
  const data:unknown=await response.json();
  const reply=extractGeminiReply(data);
  if(!reply){
   console.error('Gemini API returned no text content.');
   return NextResponse.json({error:fallbackText[lang].unavailable},{status:502});
  }
  return NextResponse.json({reply});
 }catch(error){
  console.error('Gemini API request failed.',error);
  return NextResponse.json({error:fallbackText[lang].unavailable},{status:502});
 }
}
