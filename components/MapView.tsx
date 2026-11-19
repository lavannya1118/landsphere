'use client';
import {useEffect,useRef} from 'react';
import L from 'leaflet';
import {Parcel} from '@/lib/demo';
const COL:Record<string,string>={Agricultural:'#10B981',Residential:'#3B82F6',Commercial:'#F59E0B',Forest:'#166534',Industrial:'#6B7280'};
export default function MapView({parcels,selected,onSelect,height=520}:{parcels:Parcel[];selected?:string;onSelect:(p:Parcel)=>void;height?:number}){
 const el=useRef<HTMLDivElement>(null);const map=useRef<L.Map>();const grp=useRef<L.LayerGroup>();
 useEffect(()=>{if(map.current||!el.current)return;
  const m=L.map(el.current).setView([18.6,74.4],8);
  const st=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(m);
  const sat=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'Esri'});
  grp.current=L.layerGroup().addTo(m);L.control.layers({Street:st,Satellite:sat},{Parcels:grp.current}).addTo(m);
  const lg=new (L.Control.extend({onAdd(){const d=L.DomUtil.create('div');d.style.cssText='background:#fff;padding:6px 8px;font-size:11px;border-radius:8px;color:#000';d.innerHTML=Object.entries(COL).map(([k,c])=>`<div><span style="background:${c};display:inline-block;width:10px;height:10px;margin-right:4px"></span>${k}</div>`).join('');return d;}}))({position:'bottomleft'});lg.addTo(m);
  map.current=m;return()=>{m.remove();map.current=undefined;};},[]);
 useEffect(()=>{const g=grp.current,m=map.current;if(!g||!m)return;g.clearLayers();
  parcels.forEach(p=>{const poly=L.polygon(p.coords.map(([x,y])=>[y,x] as [number,number]),{color:selected===p.id?'#000':COL[p.use],weight:selected===p.id?3:1.5,fillOpacity:.45}).addTo(g);
   poly.bindTooltip(p.id);poly.on('click',()=>onSelect(p));L.circleMarker(poly.getBounds().getCenter(),{radius:4,color:'#0B1F3A'}).addTo(g).on('click',()=>onSelect(p));});
  if(parcels.length)m.fitBounds(L.latLngBounds(parcels.flatMap(p=>p.coords.map(([x,y])=>[y,x] as [number,number]))),{maxZoom:14});},[parcels,selected]);
 return <div ref={el} style={{height}} className="rounded-2xl overflow-hidden z-0"/>;
}
