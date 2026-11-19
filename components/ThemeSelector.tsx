'use client';

import {Monitor, Moon, Sun} from 'lucide-react';
import {useLanguage} from '@/lib/language';
import {ThemePreference, useTheme} from '@/lib/theme';

const options: {value: ThemePreference; icon: typeof Sun; label: 'themeLight' | 'themeDark' | 'themeSystem'}[] = [
  {value: 'light', icon: Sun, label: 'themeLight'},
  {value: 'dark', icon: Moon, label: 'themeDark'},
  {value: 'system', icon: Monitor, label: 'themeSystem'},
];

export default function ThemeSelector({compact = false}: {compact?: boolean}) {
  const {preference, setPreference} = useTheme();
  const {t} = useLanguage();

  return (
    <div className="theme-selector" role="group" aria-label={t('themeSettings')}>
      {options.map(({value, icon: Icon, label}) => (
        <button
          key={value}
          type="button"
          aria-label={t(label)}
          aria-pressed={preference === value}
          title={t(label)}
          onClick={() => void setPreference(value)}
          className={`theme-option${preference === value ? ' is-selected' : ''}`}
        >
          <Icon size={15} aria-hidden="true" />
          {!compact && <span>{t(label)}</span>}
        </button>
      ))}
    </div>
  );
}
