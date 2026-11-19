'use client';

import {FormEvent, useEffect, useState} from 'react';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {
  BarChart3,
  Bell,
  Bot,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Map,
  MessageSquareWarning,
  Search,
  Shield,
  UserRound,
} from 'lucide-react';
import {onAuthStateChanged} from 'firebase/auth';
import type {User} from 'firebase/auth';
import {useRole} from '@/lib/store';
import {auth} from '@/lib/firebase';
import {Language, useLanguage} from '@/lib/language';
import {useTheme} from '@/lib/theme';
import Brand from './Brand';
import Chat from './Chat';
import ThemeSelector from './ThemeSelector';

const navigation = [
  ['/dashboard', 'dashboard', Home],
  ['/explorer', 'explorer', Map],
  ['/records', 'records', FileText],
  ['/assistant', 'chat', Bot],
  ['/complaints', 'complaints', MessageSquareWarning],
  ['/applications', 'applications', ClipboardList],
  ['/analytics', 'analytics', BarChart3],
  ['/admin', 'adminPanel', Shield],
  ['/profile', 'profile', UserRound],
] as const;

function isLanguage(value: string): value is Language {
  return value === 'en' || value === 'hi' || value === 'mr';
}

export default function Shell({
  children,
  staffOnly,
}: {
  children: React.ReactNode;
  staffOnly?: boolean;
}) {
  const [role] = useRole();
  const [account, setAccount] = useState<User | null>(null);
  const [query, setQuery] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const {language, setLanguage, t} = useLanguage();
  const {error: themeError} = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const blocked = staffOnly && role !== 'admin' && role !== 'officer';

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(
      auth,
      setAccount,
      error => console.error('Unable to observe the signed-in account.', error),
    );
  }, []);

  const logout = async () => {
    setLogoutError('');
    try {
      if (auth) await (await import('firebase/auth')).signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Unable to sign out.', error);
      setLogoutError(t('logoutError'));
    }
  };

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(query.trim() ? `/explorer?q=${encodeURIComponent(query.trim())}` : '/explorer');
  };

  return (
    <div className="min-h-screen md:grid md:grid-cols-[252px_minmax(0,1fr)]">
      <aside className="app-sidebar flex flex-col gap-5 p-4 md:sticky md:top-0 md:h-screen">
        <div className="flex items-center justify-between">
          <Brand variant="light" />
          <span className="rounded-full border border-white/15 px-2 py-1 text-[10px] font-semibold tracking-wide text-sage md:hidden">
            DEMO
          </span>
        </div>

        <nav aria-label="Main navigation" className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible">
          {navigation.map(([href, key, Icon]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className={`app-nav-link flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                pathname === href ? 'is-active font-semibold' : ''
              }`}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{t(key)}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto hidden space-y-4 md:block">
          <div>
            <label className="mb-1.5 block text-xs text-sage/75" htmlFor="app-language">
              {t('language')}
            </label>
            <select
              id="app-language"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white"
              value={language}
              onChange={event => {
                if (isLanguage(event.currentTarget.value)) setLanguage(event.currentTarget.value);
              }}
            >
              <option className="text-slate-900" value="en">{t('english')}</option>
              <option className="text-slate-900" value="hi">{t('hindi')}</option>
              <option className="text-slate-900" value="mr">{t('marathi')}</option>
            </select>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="app-topbar sticky top-0 z-30 flex min-h-16 items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <Brand variant="dark" iconOnly className="md:hidden" />
          <form onSubmit={search} role="search" className="hidden max-w-xl flex-1 items-center sm:flex">
            <label className="sr-only" htmlFor="global-search">{t('searchParcel')}</label>
            <div className="relative w-full">
              <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="global-search"
                className="inp !py-2 !pl-9"
                value={query}
                onChange={event => setQuery(event.currentTarget.value)}
                placeholder={t('searchParcel')}
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <label className="sr-only" htmlFor="mobile-language">{t('language')}</label>
            <select
              id="mobile-language"
              className="inp !w-auto !px-2 !py-2 text-xs md:hidden"
              value={language}
              onChange={event => {
                if (isLanguage(event.currentTarget.value)) setLanguage(event.currentTarget.value);
              }}
            >
              <option value="en">EN</option>
              <option value="hi">हिं</option>
              <option value="mr">मरा</option>
            </select>
            <ThemeSelector compact />
            <Link
              href="/dashboard#notifications"
              aria-label={t('notifications')}
              title={t('notifications')}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-navy dark:text-sage dark:hover:bg-white/10"
            >
              <Bell size={18} aria-hidden="true" />
            </Link>
            {account ? (
              <Link
                href="/profile"
                className="flex max-w-48 items-center gap-2 rounded-xl p-1.5 text-sm hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sage text-xs font-bold text-navy">
                  {(account.displayName || account.email || 'L').slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden truncate sm:block">
                  {account.displayName || account.email || t('profile')}
                </span>
              </Link>
            ) : (
              <Link href="/login" className="btn !px-3 !py-2">{t('signIn')}</Link>
            )}
            {account && (
              <button
                type="button"
                onClick={logout}
                aria-label={t('signOut')}
                title={t('signOut')}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-navy dark:text-sage dark:hover:bg-white/10"
              >
                <LogOut size={17} aria-hidden="true"/>
              </button>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sage bg-sage/50 px-3 py-2 text-xs text-navy dark:border-white/10 dark:bg-white/5 dark:text-sage">
            <span>{t('demoBanner')}</span>
            <span className="font-semibold">{t('role')}: {role === 'admin' || role === 'officer' || role === 'citizen' ? t(role) : role}</span>
          </div>
          {logoutError && <p role="alert" className="mb-4 text-sm text-red-600">{logoutError}</p>}
          {themeError && <p role="status" className="mb-4 text-sm text-amber-700 dark:text-amber-300">{themeError}</p>}
          {blocked ? (
            <div className="card">
              <p>{t('requiredStaff')}</p>
              <Link className="mt-3 inline-flex underline" href="/login">{t('signIn')}</Link>
            </div>
          ) : children}
        </main>
      </div>
      <Chat />
    </div>
  );
}
