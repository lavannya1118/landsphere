'use client';
import Shell from '@/components/Shell';
import {PieChart,Pie,Cell,Tooltip,BarChart,Bar,XAxis,YAxis,ResponsiveContainer} from 'recharts';
import {PARCELS,SEED_COMPLAINTS,CATS} from '@/lib/demo';
import {useStore} from '@/lib/store';
import {MessageKey,useLanguage} from '@/lib/language';
const C=['#10B981','#3B82F6','#F59E0B','#166534','#6B7280'];
const landUseKeys:Record<string,MessageKey>={Agricultural:'agricultural',Residential:'residential',Commercial:'commercial',Forest:'forest',Industrial:'industrial'};
const categoryKeys:Record<string,MessageKey>={'Land boundary dispute':'catBoundary','Illegal encroachment':'catEncroachment','Incorrect land record':'catIncorrect','Land-use violation':'catViolation','Ownership record discrepancy':'catOwnership',Other:'catOther'};
export default function An(){
 const {t}=useLanguage();
 const [cs]=useStore('complaints',SEED_COMPLAINTS);
 const use=Object.entries(PARCELS.reduce((a:any,p)=>(a[p.use]=(a[p.use]||0)+p.areaAcres,a),{})).map(([name,value]:any)=>({name,value:+value.toFixed(1)}));
 const vil=Object.entries(PARCELS.reduce((a:any,p)=>(a[p.village]=(a[p.village]||0)+1,a),{})).map(([name,parcels])=>({name,parcels}));
 const cat=CATS.map(category=>({name:t(categoryKeys[category]).split(' ')[0],n:cs.filter(item=>item.cat===category).length}));
 const largestUse=[...use].sort((a:any,b:any)=>b.value-a.value)[0].name as string;
 const openComplaints=cs.filter(c=>c.status!=='Resolved'&&c.status!=='Rejected').length;
 const summary=t('analyticsSummary').replace('{parcels}',String(PARCELS.length)).replace('{villages}',String(vil.length)).replace('{use}',t(landUseKeys[largestUse])).replace('{open}',String(openComplaints)).replace('{complaints}',String(cs.length));
 const xl=async()=>{const X=await import('xlsx');const wb=X.utils.book_new();X.utils.book_append_sheet(wb,X.utils.json_to_sheet(PARCELS.map(({coords,history,...r})=>r)),'Parcels');X.utils.book_append_sheet(wb,X.utils.json_to_sheet(cs),'Complaints');X.writeFile(wb,'landsphere-demo-report.xlsx');};
 const pdf=async()=>{const {jsPDF}=await import('jspdf');const QR=await import('qrcode');const d=new jsPDF();d.setFontSize(16);d.text(t('reportTitle'),14,20);d.setFontSize(10);d.text(d.splitTextToSize(summary,180),14,30);d.text(t('demoReportNote'),14,50);
  const id='RPT-'+Date.now();localStorage.setItem('ls_rpt_'+id,JSON.stringify({summary,t:new Date().toISOString()}));d.addImage(await QR.toDataURL(`${location.origin}/verify?id=${id}`),'PNG',14,60,40,40);d.text(t('qrNote'),14,106);d.save('landsphere-demo-report.pdf');};
 const chartUse=use.map(item=>({...item,name:t(landUseKeys[item.name])}));
 return <Shell staffOnly><h1 className="text-2xl font-bold mb-3">{t('analytics')}</h1><div className="card mb-4 text-sm"><b>{t('aiSummary')}</b> {summary}</div>
 <div className="grid md:grid-cols-2 gap-4"><div className="card h-72"><b>{t('landUseChart')}</b><ResponsiveContainer><PieChart><Pie data={chartUse} dataKey="value" nameKey="name" label>{chartUse.map((_,i)=><Cell key={i} fill={C[i%5]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div>
 <div className="card h-72"><b>{t('parcelsByVillage')}</b><ResponsiveContainer><BarChart data={vil}><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="parcels" fill="#0D9488"/></BarChart></ResponsiveContainer></div>
 <div className="card h-72"><b>{t('complaintsByCategory')}</b><ResponsiveContainer><BarChart data={cat}><XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="n" fill="#10B981"/></BarChart></ResponsiveContainer></div></div>
 <div className="flex gap-2 mt-4"><button className="btn" onClick={pdf}>{t('downloadPdf')}</button><button className="btn2" onClick={xl}>{t('downloadExcel')}</button></div></Shell>;
}
