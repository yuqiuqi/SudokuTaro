import {DIGITS, type Language} from '../../utils/gameplay'
type Props = {
  legalDigits: number[]
  activeCandidates: Set<number>
  noteMode: boolean
  lang: Language
  onFill: (n: number) => void
}
export function GameDigits({
  legalDigits,
  activeCandidates,
  noteMode,
  lang,
  onFill,
}: Props) {
  return (
    <>
      {DIGITS.map((n) => (
        <button
          type="button"
          key={n}
          className={`number-key ${noteMode && activeCandidates.has(n) ? 'is-noted' : ''}`}
          data-number={n}
          disabled={!legalDigits.includes(n)}
          aria-label={
            lang === 'en'
              ? `${noteMode ? 'Candidate' : 'Enter'} ${n}`
              : `${noteMode ? '候选数' : '填写'} ${n}`
          }
          aria-pressed={noteMode && activeCandidates.has(n)}
          onClick={() => onFill(n)}
        >
          {n}
        </button>
      ))}
    </>
  )
}
