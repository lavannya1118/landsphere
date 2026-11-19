import type {MetadataRoute} from 'next';

const siteUrl='https://landsphere-theta.vercel.app';

export default function robots():MetadataRoute.Robots{
 return {
  rules:{
   userAgent:'*',
   allow:['/','/explorer'],
   disallow:['/admin','/analytics','/applications','/assistant','/complaints','/dashboard','/login','/profile','/records','/verify','/api/']
  },
  sitemap:`${siteUrl}/sitemap.xml`
 };
}
