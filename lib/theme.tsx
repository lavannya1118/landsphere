'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {onAuthStateChanged} from 'firebase/auth';
import {doc, getDoc, setDoc} from 'firebase/firestore';
import {auth, configured, db} from '@/lib/firebase';
import {useLanguage} from '@/lib/language';

export type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';
type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => Promise<void>;
  error: string;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

function readLocalPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem('ls_theme');
    return isThemePreference(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

function applyTheme(preference: ThemePreference, systemIsDark: boolean): ResolvedTheme {
  const resolved: ResolvedTheme =
    preference === 'system' ? (systemIsDark ? 'dark' : 'light') : preference;
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.classList.toggle('dark', resolved === 'dark');
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    'content',
    resolved === 'dark' ? '#142B3B' : '#F5F6F2',
  );
  return resolved;
}

export function ThemeProvider({children}: {children: ReactNode}) {
  const {t} = useLanguage();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [error, setError] = useState('');
  const preferenceRef = useRef<ThemePreference>('system');
  const userRef = useRef<{uid: string} | null>(null);
  const selectionVersion = useRef(0);

  const setPreference = useCallback(
    async (next: ThemePreference) => {
      selectionVersion.current += 1;
      preferenceRef.current = next;
      setPreferenceState(next);
      setError('');
      setResolvedTheme(
        applyTheme(next, window.matchMedia('(prefers-color-scheme: dark)').matches),
      );

      try {
        localStorage.setItem('ls_theme', next);
      } catch (saveError) {
        console.error('Unable to save the local theme preference.', saveError);
        setError(t('themeSaveError'));
      }

      if (!userRef.current || !configured || !db) return;
      try {
        await setDoc(
          doc(db, 'userPreferences', userRef.current.uid),
          {theme: next, updatedAt: Date.now()},
          {merge: true},
        );
      } catch (saveError) {
        console.error('Unable to save the account theme preference.', saveError);
        setError(t('themeSaveError'));
      }
    },
    [t],
  );

  useEffect(() => {
    let active = true;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const localPreference = readLocalPreference();
    preferenceRef.current = localPreference;
    setPreferenceState(localPreference);
    setResolvedTheme(applyTheme(localPreference, media.matches));

    const applySystemPreference = () => {
      if (preferenceRef.current === 'system') {
        setResolvedTheme(applyTheme('system', media.matches));
      }
    };
    media.addEventListener('change', applySystemPreference);

    const unsubscribe = configured && auth && db
      ? onAuthStateChanged(
          auth,
          async user => {
            userRef.current = user ? {uid: user.uid} : null;
            if (!user || !db) return;
            const versionAtLookup = selectionVersion.current;
            try {
              const reference = doc(db, 'userPreferences', user.uid);
              const snapshot = await getDoc(reference);
              if (!active || versionAtLookup !== selectionVersion.current) return;
              const accountPreference = snapshot.data()?.theme;
              if (isThemePreference(accountPreference)) {
                preferenceRef.current = accountPreference;
                setPreferenceState(accountPreference);
                try {
                  localStorage.setItem('ls_theme', accountPreference);
                } catch (saveError) {
                  console.error('Unable to cache the account theme preference.', saveError);
                }
                setResolvedTheme(
                  applyTheme(accountPreference, media.matches),
                );
              } else {
                await setDoc(
                  reference,
                  {theme: preferenceRef.current, updatedAt: Date.now()},
                  {merge: true},
                );
              }
            } catch (loadError) {
              console.error('Unable to load the account theme preference.', loadError);
              if (active) setError(t('themeSaveError'));
            }
          },
          authError => {
            console.error('Unable to observe the signed-in theme account.', authError);
            if (active) setError(t('themeSaveError'));
          },
        )
      : () => {};

    return () => {
      active = false;
      unsubscribe();
      media.removeEventListener('change', applySystemPreference);
    };
  }, [t]);

  return (
    <ThemeContext.Provider value={{preference, resolvedTheme, setPreference, error}}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
