import type {Language} from '../../utils/gameplay'
import {GameIcon} from './GameIcon'
import './LanguageSwitch.scss'

export function LanguageSwitch({lang, onChange}: {lang: Language; onChange: (language: Language) => void}) {
  return (
    <div className="language-switch" role="group" aria-label={lang === 'zh' ? '语言' : 'Language'}>
      {(['zh', 'en'] as const).map((language) => (
        <button
          key={language}
          type="button"
          aria-label={language === 'zh' ? '中文' : 'English'}
          aria-pressed={lang === language}
          onClick={() => { if (language !== lang) onChange(language) }}
        >
          <span className="language-switch__check" aria-hidden="true">
            {lang === language && <GameIcon name="check" />}
          </span>
          {language === 'zh' ? '中文' : 'English'}
        </button>
      ))}
    </div>
  )
}
