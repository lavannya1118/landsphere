import './globals.css';
import 'leaflet/dist/leaflet.css';
import {Inter,Manrope} from 'next/font/google';
import PWA from '@/components/PWA';
import {LanguageProvider} from '@/lib/language';
import {ThemeProvider} from '@/lib/theme';

const inter=Inter({subsets:['latin'],variable:'--font-inter',display:'swap'});
const manrope=Manrope({subsets:['latin'],variable:'--font-manrope',display:'swap'});

const themeBootstrap=`(()=>{try{const p=localStorage.getItem('ls_theme');const m=window.matchMedia('(prefers-color-scheme: dark)').matches;const d=p==='dark'||(p!=='light'&&m);document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.classList.toggle('dark',d)}catch{document.documentElement.dataset.theme='light'}})()`;

export const metadata={
 title:'LandSphere — Smart Land Governance',
 description:'One Map. One Record. Smarter Land Governance. Explore clearly labeled demonstration land data and digital workflows.',
 manifest:'/manifest.webmanifest',
 appleWebApp:{capable:true,title:'LandSphere'},
 icons:{icon:'/favicon.svg',apple:'/landsphere-app-icon.svg'},
};
export const viewport={themeColor:'#F5F6F2'};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:themeBootstrap}}/></head><body className={`${inter.variable} ${manrope.variable}`}><LanguageProvider><ThemeProvider>{children}<PWA/></ThemeProvider></LanguageProvider></body></html>;
}
