'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Bot,
  FileCheck2,
  FileText,
  Map,
  MessageSquareWarning,
  ShieldCheck,
} from 'lucide-react';
import {PARCELS} from '@/lib/demo';
import {Language, MessageKey, useLanguage} from '@/lib/language';
import Brand from '@/components/Brand';
import ThemeSelector from '@/components/ThemeSelector';

const features: [typeof Map, MessageKey, MessageKey][] = [
  [Map, 'explorer', 'descExplorer'],
  [FileText, 'featureRecords', 'descRecords'],
  [Bot, 'featureChat', 'descChat'],
  [MessageSquareWarning, 'featureComplaints', 'descComplaints'],
  [BarChart3, 'featureAnalytics', 'descAnalytics'],
  [ShieldCheck, 'featureVerify', 'descVerify'],
];

function isLanguage(value: string): value is Language {
  return value === 'en' || value === 'hi' || value === 'mr';
}

function MapIllustration() {
  return (
    <div className="hero-grid relative min-h-[330px] overflow-hidden rounded-[1.75rem] border border-sage bg-white p-5 shadow-[0_24px_70px_rgba(20,43,59,0.12)] dark:border-white/10 dark:bg-[#172B38] sm:min-h-[430px] sm:p-7">
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald">{'GIS · DEMO'}</p>
          <p className="mt-1 text-sm font-semibold">Pune district</p>
        </div>
        <span className="rounded-full border border-sage bg-white/80 px-3 py-1 text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-sage">
          Illustrative data
        </span>
      </div>
      <svg
        viewBox="0 0 640 410"
        role="img"
        aria-label="Illustrative map of fictional land parcels"
        className="absolute inset-0 h-full w-full p-5 pt-16 sm:p-8 sm:pt-20"
      >
        <path d="M56 272 103 110l115-31 89 58 13 83-70 53-19 108-122-8Z" fill="#DCE7E3" opacity=".62"/>
        <path d="m232 79 105-38 91 56-17 86-104 27-100-73Z" fill="#E8EEE9" opacity=".84"/>
        <path d="m320 210 105-27 90 55-22 98-125 26-67-61Z" fill="#DCE7E3" opacity=".75"/>
        <path d="m218 273 70-53 77 81-43 81-112-2Z" fill="#EBF0EC" opacity=".9"/>
        <g fill="#B7D7C8" stroke="#24765B" strokeWidth="3">
          <path d="m126 126 78-22 42 37-30 55-75 7-35-37Z"/>
          <path d="m247 111 78 21 9 52-67 29-51-37Z"/>
          <path d="m354 77 70 21 18 65-61 24-61-31Z"/>
          <path d="m117 209 76-6 28 62-59 35-64-28Z"/>
          <path d="m277 220 70-30 42 50-24 58-77 3-28-39Z"/>
          <path d="m432 194 74 42-19 54-75-7-25-48Z"/>
          <path d="m226 290 60-33 47 53-21 52-74-4-31-34Z"/>
        </g>
        <g fill="#24765B" stroke="#F5F6F2" strokeWidth="5">
          <circle cx="181" cy="158" r="8"/>
          <circle cx="284" cy="158" r="8"/>
          <circle cx="388" cy="125" r="8"/>
          <circle cx="324" cy="266" r="8"/>
          <circle cx="465" cy="251" r="8"/>
        </g>
        <path d="M75 332c74-48 141-44 212-10s126 28 225-27" fill="none" stroke="#16A69A" strokeDasharray="7 9" strokeLinecap="round" strokeWidth="4"/>
      </svg>
      <div className="absolute bottom-5 left-5 right-5 z-10 flex items-end justify-between gap-3 sm:bottom-7 sm:left-7 sm:right-7">
        <div className="rounded-2xl border border-sage bg-white/95 p-3 shadow-sm dark:border-white/10 dark:bg-[#142B3B]/95">
          <p className="text-[10px] font-medium text-slate-500 dark:text-sage">Selected parcel</p>
          <p className="mt-1 text-sm font-bold text-navy dark:text-white">DEMO-SHI-002</p>
          <p className="mt-1 text-[10px] text-slate-500 dark:text-sage">Shirur · sample polygon</p>
        </div>
        <div className="rounded-2xl border border-sage bg-white/95 p-3 shadow-sm dark:border-white/10 dark:bg-[#142B3B]/95">
          <div className="flex items-center gap-2 text-[10px] font-semibold">
            <span className="size-2 rounded-full bg-emerald"/>
            <span>Sample boundary</span>
          </div>
          <div className="mt-2 h-1.5 w-24 rounded-full bg-sage dark:bg-white/15">
            <div className="h-full w-2/3 rounded-full bg-teal"/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const {language, setLanguage, t} = useLanguage();
  const statistics: [string, MessageKey][] = [
    [String(PARCELS.length), 'demoParcels'],
    [String(new Set(PARCELS.map(parcel => parcel.district)).size), 'districts'],
    ['3', 'languages'],
  ];

  return (
    <div className="min-h-screen">
      <header className="site-header sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Brand variant="dark" />
          <nav aria-label="Page navigation" className="ml-auto hidden items-center gap-6 text-sm text-slate-600 dark:text-sage lg:flex">
            <a href="#features" className="transition hover:text-emerald">{t('features')}</a>
            <a href="#how-it-works" className="transition hover:text-emerald">{t('howItWorks')}</a>
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <div className="hidden sm:block">
              <ThemeSelector compact />
            </div>
            <label className="sr-only" htmlFor="home-language">{t('language')}</label>
            <select
              id="home-language"
              className="rounded-xl border border-sage bg-white px-2 py-2 text-xs text-navy dark:border-white/10 dark:bg-[#172B38] dark:text-sage"
              value={language}
              onChange={event => {
                if (isLanguage(event.currentTarget.value)) setLanguage(event.currentTarget.value);
              }}
            >
              <option value="en">EN</option>
              <option value="hi">हिं</option>
              <option value="mr">मरा</option>
            </select>
            <Link href="/login" className="btn !px-3 !py-2 sm:!px-4">{t('signIn')}</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-sage bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald dark:border-white/10 dark:bg-white/5">
              <span className="size-1.5 rounded-full bg-teal"/>
              Smart land governance platform
            </p>
            <p className="mt-6 text-sm font-semibold tracking-wide text-emerald">{t('tagline')}</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-tight text-navy dark:text-white sm:text-5xl lg:text-6xl">
              {t('hero')}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 dark:text-sage sm:text-lg">
              {t('intro')}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/explorer" className="btn2">
                <Map size={17} aria-hidden="true"/>
                {t('exploreLand')}
                <ArrowRight size={16} aria-hidden="true"/>
              </Link>
              <Link href="/assistant" className="inline-flex items-center gap-2 rounded-xl border border-sage px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-sage/50 dark:border-white/15 dark:text-white dark:hover:bg-white/10">
                <Bot size={17} aria-hidden="true"/>
                {t('chat')}
              </Link>
            </div>
            <p className="mt-5 max-w-xl text-xs leading-5 text-slate-500 dark:text-sage">{t('demoDisclaimer')}</p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-sage pt-5 text-xs text-slate-500 dark:border-white/10 dark:text-sage">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-emerald"/>{t('featureVerify')}</span>
              <span className="inline-flex items-center gap-2"><FileCheck2 size={15} className="text-emerald"/>{t('featureRecords')}</span>
            </div>
          </div>
          <MapIllustration/>
        </section>

        <section aria-label={t('demoParcels')} className="border-y border-sage bg-white/55 dark:border-white/10 dark:bg-white/[0.025]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-sage px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8 dark:divide-white/10">
            {statistics.map(([value, key]) => (
              <div key={key} className="px-5 py-5 text-center sm:py-7">
                <p className="font-heading text-3xl font-extrabold tracking-tight text-navy dark:text-white">{value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-sage">{t(key)}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald">{t('features')}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy dark:text-white sm:text-4xl">{t('intro')}</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([Icon, title, description]) => (
              <article key={title} className="card group min-h-44 transition duration-200 hover:-translate-y-0.5">
                <span className="grid size-10 place-items-center rounded-xl bg-sage/70 text-emerald dark:bg-white/10 dark:text-teal">
                  <Icon size={19} aria-hidden="true"/>
                </span>
                <h3 className="mt-4 text-base font-bold">{t(title)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-sage">{t(description)}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="border-y border-sage bg-white/55 dark:border-white/10 dark:bg-white/[0.025]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald">{t('howItWorks')}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy dark:text-white sm:text-4xl">{t('stepExploreDesc')}</h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ['01', 'stepExplore', 'stepExploreDesc'],
                ['02', 'stepTrack', 'stepTrackDesc'],
                ['03', 'stepAct', 'stepActDesc'],
              ].map(([number, title, description]) => (
                <article key={number} className="rounded-2xl border border-sage bg-[var(--surface)] p-5 dark:border-white/10">
                  <span className="font-heading text-sm font-extrabold text-teal">{number}</span>
                  <h3 className="mt-5 text-lg font-bold">{t(title as MessageKey)}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-sage">{t(description as MessageKey)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 dark:text-sage">
        <Brand variant="dark"/>
        <p>{t('demoDisclaimer')}</p>
        <Link href="/login" className="font-semibold text-emerald hover:underline">{t('signIn')}</Link>
      </footer>
    </div>
  );
}
