import type {MetadataRoute} from 'next';

const siteUrl='https://landsphere-theta.vercel.app';

export default function sitemap():MetadataRoute.Sitemap{
 return [
  {url:siteUrl,changeFrequency:'weekly',priority:1},
  {url:`${siteUrl}/explorer`,changeFrequency:'weekly',priority:0.8}
 ];
}
