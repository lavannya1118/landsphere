'use client';

import Shell from '@/components/Shell';
import ThemeSelector from '@/components/ThemeSelector';
import {useStore, useRole} from '@/lib/store';
import {useLanguage} from '@/lib/language';
import {useTheme} from '@/lib/theme';

export default function Profile() {
  const [profile, setProfile] = useStore('profile', {name: '', phone: ''});
  const [role] = useRole();
  const [favorites] = useStore<string[]>('fav', []);
  const {language, setLanguage, t} = useLanguage();
  const {error: themeError} = useTheme();

  return (
    <Shell>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald">{t('profile')}</p>
        <h1 className="mt-2 text-3xl font-bold">{t('profileTitle')}</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <section className="card space-y-4">
          <div className="flex items-center gap-3 border-b border-sage pb-4 dark:border-white/10">
            <span className="grid size-12 place-items-center rounded-2xl bg-sage text-lg font-bold text-navy dark:bg-white/10 dark:text-white">
              {(profile.name || 'L').slice(0, 1).toUpperCase()}
            </span>
            <div>
              <h2 className="font-bold">{profile.name || t('profileTitle')}</h2>
              <p className="text-xs text-slate-500 dark:text-sage">
                {t('role')}: {role === 'admin' || role === 'officer' || role === 'citizen' ? t(role) : role}
              </p>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="profile-name">{t('name')}</label>
            <input
              id="profile-name"
              className="inp"
              autoComplete="name"
              placeholder={t('name')}
              value={profile.name}
              onChange={event => setProfile({...profile, name: event.currentTarget.value})}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="profile-phone">{t('phone')}</label>
            <input
              id="profile-phone"
              className="inp"
              type="tel"
              autoComplete="tel"
              placeholder={t('phone')}
              value={profile.phone}
              onChange={event => setProfile({...profile, phone: event.currentTarget.value})}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="profile-language">{t('language')}</label>
            <select
              id="profile-language"
              className="inp"
              value={language}
              onChange={event => {
                const value = event.currentTarget.value;
                if (value === 'en' || value === 'hi' || value === 'mr') setLanguage(value);
              }}
            >
              <option value="en">{t('english')}</option>
              <option value="hi">{t('hindi')}</option>
              <option value="mr">{t('marathi')}</option>
            </select>
          </div>
          <p className="text-xs text-slate-500 dark:text-sage">
            {t('savedParcelsLabel')}: {favorites.join(', ') || '—'}
          </p>
        </section>

        <section className="card h-fit space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald">{t('themeSettings')}</p>
            <h2 className="mt-2 text-lg font-bold">{t('themeSettings')}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-sage">{t('themeSystem')}</p>
          </div>
          <ThemeSelector />
          {themeError && <p role="status" className="text-sm text-amber-700 dark:text-amber-300">{themeError}</p>}
        </section>
      </div>
    </Shell>
  );
}
