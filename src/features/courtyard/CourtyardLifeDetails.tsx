type Props = {count: number; restoringToken?: string | null}
const themes = [
  'mintLife',
  'windowLife',
  'chairLife',
  'clothLife',
  'chimeLife',
  'doorLife',
] as const
/** Bounded, additive signs of everyday use. Levels are derived, never stored. */
export function CourtyardLifeDetails({count, restoringToken}: Props) {
  return (
    <>
      {themes.map((theme, index) => {
        const level = Math.max(0, Math.min(2, count - index * 2))
        if (!level) return null
        return (
          <g
            key={theme}
            data-life-detail={theme}
            data-level={level}
            className={
              restoringToken === theme ? 'courtyard-life-restore' : undefined
            }
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {theme === 'mintLife' && (
              <>
                <path
                  d="M477 204c-2-8 1-16 6-20m-5 13c-8-2-11-8-6-10 6 1 8 5 6 10Zm3-7c0-8 7-11 10-7-1 5-4 7-10 7Z"
                  fill="#749565"
                  stroke="#5D8058"
                  strokeWidth="1"
                />
                {level === 2 && count < 12 && (
                  <g>
                    <ellipse
                      cx="450"
                      cy="237"
                      rx="8"
                      ry="3"
                      fill="#647D70"
                      opacity=".2"
                    />
                    <path d="M444 228h12l-1 9c-2 3-9 3-10 0Z" fill="#C9D9C1" />
                    <ellipse cx="450" cy="228" rx="6" ry="2" fill="#859D77" />
                    <path
                      d="m449 227 3-8m-2 4-4-3m5 1 4-2"
                      stroke="#648158"
                      strokeWidth="1.3"
                    />
                  </g>
                )}
              </>
            )}
            {theme === 'windowLife' && (
              <>
                <path d="m430 174 19 1 4 14-20 2Z" fill="#C0CAB4" />
                <path
                  d="m434 178 2 9m5-10 2 9"
                  stroke="#A5B49B"
                  strokeWidth="1"
                />
                {level === 2 && (
                  <>
                    <path d="m394 179 25 1 6 8-27-1Z" fill="#7D9289" />
                    <path d="m396 181 22 1 4 4-23-1Z" fill="#F0E6D1" />
                    <path
                      d="m398 187 26 1"
                      stroke="#536F66"
                      strokeWidth="1.5"
                    />
                  </>
                )}
              </>
            )}
            {theme === 'chairLife' && (
              <>
                <path d="m290 240 24-4 10 8-24 4Z" fill="#879F90" />
                <path d="m410 239 24 4-8 7-23-5Z" fill="#CFB996" />
                <path
                  d="m295 242 20-3m-7 6 8-1"
                  stroke="#B8C9B4"
                  strokeWidth="1"
                />
                {level === 2 && count < 12 && (
                  <ellipse cx="414" cy="248" rx="8" ry="2.7" fill="#D9DDC7" />
                )}
              </>
            )}
            {theme === 'clothLife' && (
              <>
                <path d="m359 247 11-2 2 7-11 3Z" fill="#819EAA" />
                <path
                  d="m360 248 9-2m-7 6 8-2"
                  stroke="#CBD6CE"
                  strokeWidth=".8"
                  strokeDasharray="1 2"
                />
                {level === 2 && (
                  <>
                    <path d="m331 228 16-2 7 5-16 3Z" fill="#A9987A" />
                    <path d="m331 228 7 6 16-3v7l-16 3-7-6Z" fill="#B6A48B" />
                    <path
                      d="m338 235 16-3m-8 0v3"
                      stroke="#7E7C64"
                      strokeWidth="1"
                    />
                  </>
                )}
              </>
            )}
            {theme === 'chimeLife' && (
              <>
                <path d="m323 119 4 2-2 20-5-1Z" fill="#E2E7CA" />
                <path
                  d="m322 127 3-1m-3 5 2-1"
                  stroke="#7F9B7C"
                  strokeWidth="1"
                />
                {level === 2 && (
                  <>
                    <path d="m512 203-6 39 9 2 3-39Z" fill="#758F91" />
                    <path
                      d="m514 205 1-13c0-8 8-8 8-2"
                      stroke="#817C65"
                      strokeWidth="2"
                    />
                    <path d="m510 216 6 1" stroke="#C5CFBD" strokeWidth="1.5" />
                  </>
                )}
              </>
            )}
            {theme === 'doorLife' && (
              <>
                <path d="m265 143 5 0-1 8-4 0Z" fill="#A48960" />
                <path d="m267 145 0 4" stroke="#E4D4A7" strokeWidth="1" />
                {level === 2 && (
                  <>
                    <ellipse
                      cx="369"
                      cy="243"
                      rx="7"
                      ry="2.5"
                      fill="#A6B7AC"
                      opacity=".4"
                    />
                    <path d="M364 237h10v5c-1 3-9 3-10 0Z" fill="#C9D9C1" />
                    <ellipse cx="369" cy="237" rx="5" ry="1.8" fill="#859D77" />
                  </>
                )}
              </>
            )}
          </g>
        )
      })}
    </>
  )
}
