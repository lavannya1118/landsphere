import type {MetadataRoute} from 'next';

export default function manifest():MetadataRoute.Manifest {
  return {
    name:'LandSphere',
    short_name:'LandSphere',
    description:'One Map. One Record. Smarter Land Governance.',
    start_url:'/dashboard',
    display:'standalone',
    background_color:'#F5F6F2',
    theme_color:'#142B3B',
    icons:[
      {src:'/landsphere-app-icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'},
      {src:'/icon-192.png',sizes:'192x192',type:'image/png'},
      {src:'/icon-512.png',sizes:'512x512',type:'image/png'},
    ],
  };
}
