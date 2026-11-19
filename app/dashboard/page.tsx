'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';
import {
  ArrowUpRight,
  ClipboardList,
  FileText,
  Map,
  MessageSquareWarning,
  Plus,
} from 'lucide-react';
import type {User} from 'firebase/auth';
import {onAuthStateChanged} from 'firebase/auth';
import Shell from '@/components/Shell';
import {PARCELS, SEED_APPS, SEED_COMPLAINTS, Parcel} from '@/lib/demo';
import {useStore} from '@/lib/store';
import {MessageKey, useLanguage} from '@/lib/language';
import {auth} from '@/lib/firebase';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="grid h-[250px] place-items-center text-sm text-slate-500">Loading map…</div>,
});

const stageKeys: Record<string, MessageKey> = {
  Submitted: 'stageSubmitted',
  'Under Review': 'stageReview',
  Assigned: 'stageAssigned',
  Investigation: 'stageInvestigation',
  Resolved: 'stageResolved',
  Rejected: 'stageRejected',
  Approved: 'stageApproved',
};

export default function Dashboard() {
  const [favorites] = useStore<string[]>('fav', []);
  const [complaints] = useStore('complaints', SEED_COMPLAINTS);
  const [applications] = useStore('apps', SEED_APPS);
  const [profile] = useStore('profile', {name: '', phone: ''});
  const [account, setAccount] = useState<User | null>(null);
  const {t} = useLanguage();
  const savedParcels = useMemo(
    () => PARCELS.filter(parcel => favorites.includes(parcel.id)),
    [favorites],
  );
  const savedArea = savedParcels.reduce((total, parcel) => total + parcel.areaAcres, 0);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(
      auth,
      setAccount,
      error => console.error('Unable to observe the dashboard account.', error),
    );
  }, []);

  const name = account?.displayName || profile.name || account?.email?.split('@')[0];
  const recentActivity = useMemo(() => {
    const items = [
      ...complaints.map(item => ({
        id: item.id,
        label: t('complaints'),
        status: item.status,
        date: item.date,
        href: '/complaints',
      })),
      ...applications.map(item => ({
        id: item.id,
        label: t('applications'),
        status: item.status,
        date: item.date,
        href: '/applications',
      })),
    ];
    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  }, [applications, complaints, t]);

  const metrics = [
    {label: t('savedParcels'), value: savedParcels.length, icon: Map, color: 'text-emerald'},
    {label: t('savedDemoArea'), value: `${savedArea.toFixed(1)} ac`, icon: FileText, color: 'text-teal'},
    {label: t('myComplaints'), value: complaints.length, icon: MessageSquareWarning, color: 'text-amber-600'},
    {label: t('applications'), value: applications.length, icon: ClipboardList, color: 'text-sky-700'},
  ];
  const previewParcels: Parcel[] = savedParcels.length ? savedParcels.slice(0, 5) : PARCELS.slice(0, 5);

  return (
    <Shell>
      <section className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald">{t('citizenDashboard')}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {name ? `${t('welcomeBack')}, ${name}` : t('welcomeBack')}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-sage">{t('dashboardSubhead')}</p>
        </div>
        <Link href="/explorer" className="btn2">
          <Plus size={16} aria-hidden="true"/>
          {t('exploreLand')}
        </Link>
      </section>

      <section aria-label={t('citizenDashboard')} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({label, value, icon: Icon, color}) => (
          <article key={label} className="card flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-sage">{label}</p>
              <p className="mt-3 font-heading text-3xl font-extrabold tracking-tight">{value}</p>
            </div>
            <span className={`grid size-10 place-items-center rounded-xl bg-sage/60 dark:bg-white/10 ${color}`}>
              <Icon size={18} aria-hidden="true"/>
            </span>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <article className="card !p-0">
          <div className="flex items-center justify-between gap-4 p-5 pb-3">
            <div>
              <h2 className="text-lg font-bold">{t('savedParcels')}</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-sage">{t('demoDisclaimer')}</p>
            </div>
            <Link href="/explorer" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald hover:underline">
              {t('openMap')} <ArrowUpRight size={14} aria-hidden="true"/>
            </Link>
          </div>
          <div className="h-[250px] overflow-hidden rounded-b-2xl">
            <MapView parcels={previewParcels} onSelect={() => {}} height={250}/>
          </div>
          <div className="px-5 py-3 text-xs text-slate-500 dark:text-sage">
            {savedParcels.length ? `${savedParcels.length} ${t('parcels')}` : t('emptySavedParcels')}
          </div>
        </article>

        <article id="notifications" className="card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">{t('recentActivity')}</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-sage">{t('notifications')}</p>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-sage/60 text-emerald dark:bg-white/10">
              <MessageSquareWarning size={17} aria-hidden="true"/>
            </span>
          </div>
          <div className="mt-4 divide-y divide-sage dark:divide-white/10">
            {recentActivity.map(item => (
              <Link key={item.id} href={item.href} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{item.id}</span>
                  <span className="mt-1 block text-xs text-slate-500 dark:text-sage">{item.label} · {item.date}</span>
                </span>
                <span className="shrink-0 rounded-full bg-sage/60 px-2.5 py-1 text-[10px] font-semibold text-navy dark:bg-white/10 dark:text-sage">
                  {t(stageKeys[item.status] || 'stageSubmitted')}
                </span>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-lg font-bold">{t('quickActions')}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {href: '/explorer', icon: Map, label: t('openMap'), detail: t('descExplorer')},
            {href: '/records', icon: FileText, label: t('viewRecords'), detail: t('descRecords')},
            {href: '/applications', icon: ClipboardList, label: t('applicationTracking'), detail: t('pendingApplications')},
          ].map(({href, icon: Icon, label, detail}) => (
            <Link key={href} href={href} className="card group flex items-center gap-3 transition hover:-translate-y-0.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sage/60 text-emerald dark:bg-white/10">
                <Icon size={18} aria-hidden="true"/>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{label}</span>
                <span className="mt-1 block truncate text-xs text-slate-500 dark:text-sage">{detail}</span>
              </span>
              <ArrowUpRight size={16} className="text-slate-400 transition group-hover:text-emerald" aria-hidden="true"/>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}
