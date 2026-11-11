import {useId} from 'react'
import type {Language} from '../../utils/gameplay'
import type {Atmosphere} from './world'
import type {CourtyardObjectId} from './objects'
import {CourtyardLifeDetails} from './CourtyardLifeDetails'

/**
 * Original project artwork, authored as SVG on 2026-11-11.
 * Palette: limewashed ivory #E9E1D1, blue-grey brick #718181,
 * moss #718575, old wood #806952, brass #B88B4A, lamp #E6BC71.
 * No external references, images, fonts or baked text. Stage is the latest
 * unlocked chapter (0..7), not the count. Parent should pass reduced=true
 * while hidden/offscreen; native reduced-motion is also respected below.
 */
export default function CourtyardScene({
  stage = 0,
  lang = 'zh',
  atmosphere = 'dusk',
  lifeCount = 0,
  lifeRestoringToken,
  interaction,
  reduced = false,
  restoringToken,
}: {
  stage?: number
  lang?: Language
  atmosphere?: Atmosphere
  lifeCount?: number
  lifeRestoringToken?: string | null
  interaction?: {token: CourtyardObjectId; serial: number} | null
  reduced?: boolean
  restoringToken?: string | null
}) {
  const uid = useId().replace(/:/g, '')
  const id = (name: string) => `courtyard-${uid}-${name}`
  const level = Math.max(0, Math.min(7, Math.floor(stage)))
  const present = (at: number) => level >= at
  const count =
    level === 7 ? Math.max(0, Math.min(12, Math.floor(lifeCount))) : 0
  const colors =
    atmosphere === 'day'
      ? {
          sky: '#E9EFE0',
          wall: '#F5EEDB',
          wallShade: '#E4DFC9',
          ground: '#DFE3CC',
          farGround: '#F0ECDA',
        }
      : atmosphere === 'rain'
        ? {
            sky: '#CAD8D4',
            wall: '#DFE3D5',
            wallShade: '#BDCFC7',
            ground: '#B7C9C1',
            farGround: '#D1DED2',
          }
        : {
            sky: '#F0ECE2',
            wall: '#F0E9DC',
            wallShade: '#DFD6C6',
            ground: '#D7D7C8',
            farGround: '#ECE7DB',
          }
  const touchLocations: Record<CourtyardObjectId, [number, number]> = {
    doorLight: [126, 132],
    mint: [478, 211],
    window: [435, 151],
    chairs: [365, 243],
    mendedCloth: [365, 240],
    windChime: [314, 120],
    doorNote: [273, 161],
    windowLight: [407, 141],
  }
  return (
    <svg
      className="courtyard-art"
      data-reduced={reduced ? 'true' : 'false'}
      data-stage={level}
      data-atmosphere={atmosphere}
      data-life-count={count}
      data-restoring-token={reduced ? undefined : restoringToken || undefined}
      viewBox="0 0 600 320"
      fill="none"
      role="img"
      aria-labelledby={`${id('title')} ${id('description')}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={id('title')}>
        {lang === 'en' ? 'The Fangcun Courtyard' : '方寸旧院'}
      </title>
      <desc id={id('description')}>
        {lang === 'en'
          ? {
              day: 'Daylight in the courtyard. ',
              dusk: 'Dusk in the courtyard. ',
              rain: 'Gentle rain in the courtyard. ',
            }[atmosphere]
          : {day: '晴日的院子。', dusk: '暮色的院子。', rain: '细雨中的院子。'}[
              atmosphere
            ]}
        {lang === 'en'
          ? present(7)
            ? 'Blue-grey courtyard walls surround warm door and window lights. Mint grows by the window; two wooden chairs face different directions beside a mended tablecloth. A wind chime hangs under the eaves, and a new paper note rests beside the door.'
            : `A quiet courtyard with a brass lamp glowing beside the doorstep. Restoration has reached chapter ${level + 1} of eight.`
          : present(7)
            ? '灰青院墙围着温暖的门灯与窗灯。薄荷靠窗，两把木椅朝向不同的方向，放在补好的桌布旁，檐下挂着风铃，门边留着新的纸牌。'
            : `一座安静的小院，门槛边亮着铜灯。修复已进行到第${level + 1}篇。`}
        {count > 0 &&
          (lang === 'en'
            ? ` ${count} of twelve courtyard life notes have brought small signs of everyday use.`
            : `院中已有${count}张生活笺留下的日常痕迹。`)}
      </desc>
      <defs>
        <linearGradient
          id={id('wall')}
          x1="150"
          y1="36"
          x2="345"
          y2="220"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={colors.wall} />
          <stop offset="1" stopColor={colors.wallShade} />
        </linearGradient>
        <linearGradient
          id={id('ground')}
          x1="270"
          y1="202"
          x2="330"
          y2="320"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={colors.ground} />
          <stop offset="1" stopColor={colors.farGround} />
        </linearGradient>
        <radialGradient id={id('lampGlow')}>
          <stop stopColor="#FFDF91" stopOpacity=".65" />
          <stop offset="1" stopColor="#FFDF91" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id={id('paperLight')}
          x1="385"
          y1="100"
          x2="444"
          y2="174"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFF0BD" />
          <stop offset="1" stopColor="#E3B86F" />
        </linearGradient>
        <clipPath id={id('bounds')}>
          <rect width="600" height="320" rx="22" />
        </clipPath>
      </defs>
      <style>{`
        .courtyard-art .courtyard-lamp-breath { animation: courtyard-lamp-breathe 9s ease-in-out infinite; }
        .courtyard-art .courtyard-chime-sway { transform-box: fill-box; transform-origin: top center; animation: courtyard-chime-sway 8s ease-in-out infinite; }
        .courtyard-art[data-reduced="true"] .courtyard-lamp-breath,
        .courtyard-art[data-reduced="true"] .courtyard-chime-sway,
        .courtyard-art[data-reduced="true"] .courtyard-rain-lines { animation: none; }
        .courtyard-art .courtyard-rain-lines { animation: courtyard-rain 1800ms linear infinite; }
        .courtyard-art .courtyard-life-restore { animation: courtyard-restore 600ms ease-out both; }
        .courtyard-art .courtyard-touch-feedback { animation: courtyard-touch 240ms ease-out both; }
        @keyframes courtyard-rain { from {transform:translate(0,-16px)} to {transform:translate(-4px,16px)} }
        @keyframes courtyard-touch { from {opacity:.75} to {opacity:0} }
        .courtyard-art[data-restoring-token="doorLight"] [data-scene-token="doorLight"],
        .courtyard-art[data-restoring-token="mint"] [data-scene-token="mint"],
        .courtyard-art[data-restoring-token="window"] [data-scene-token="window"],
        .courtyard-art[data-restoring-token="chairs"] [data-scene-token="chairs"],
        .courtyard-art[data-restoring-token="mendedCloth"] [data-scene-token="mendedCloth"],
        .courtyard-art[data-restoring-token="windChime"] [data-scene-token="windChime"],
        .courtyard-art[data-restoring-token="doorNote"] [data-scene-token="doorNote"],
        .courtyard-art[data-restoring-token="windowLight"] [data-scene-token="windowLight"] { animation: courtyard-restore 600ms ease-out both; }
        @keyframes courtyard-restore { from { opacity: 0; } to { opacity: 1; } }
        @keyframes courtyard-lamp-breathe { 0%,100% { opacity: .66; } 50% { opacity: .88; } }
        @keyframes courtyard-chime-sway { 0%,100% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } }
        @media (prefers-reduced-motion: reduce) {
          .courtyard-art .courtyard-lamp-breath, .courtyard-art .courtyard-chime-sway, .courtyard-art [data-scene-token], .courtyard-art [data-life-detail], .courtyard-art .courtyard-rain-lines, .courtyard-art .courtyard-touch-feedback { animation: none !important; }
        }
      `}</style>
      <g clipPath={`url(#${id('bounds')})`}>
        {/* Muted sky, one airy blank pocket above the courtyard. */}
        <path fill={colors.sky} d="M0 0h600v320H0z" />
        <path
          d="M344 33c34-17 87-10 107 7 28-7 64 1 79 14H315c5-11 16-18 29-21Z"
          fill="#FAF7EF"
        />
        <path
          d="M40 26c21-8 51-5 68 6 16-3 32 1 43 9H18c4-7 12-12 22-15Z"
          fill="#F8F5EC"
        />

        {/* Back wall, return wall and shaded plinth establish a shallow 2.5D room. */}
        <path d="m72 76 405-9 64 43v116L73 238Z" fill={`url(#${id('wall')})`} />
        <path d="m477 67 64 43v116l-64-24Z" fill="#C5C8BD" />
        <path d="m73 201 404-7 64 32-468 12Z" fill="#A8B3AA" />
        <path d="m73 211 404-6 64 25-468 18Z" fill="#9CAAA3" />
        <path d="m73 219 404-5 64 23-468 17Z" fill="#889994" />
        <path d="m73 238 468-12 59 94H0Z" fill={`url(#${id('ground')})`} />
        <path d="m90 239 419-10 53 70-507 8Z" fill="#DDDCD0" />
        {/* Discontinuous joints; a few marks rather than a noisy texture. */}
        <g stroke="#C0C4B7" strokeWidth="1.2" strokeLinecap="round">
          <path d="m76 263 445-11M55 288l489-13M149 237l-32 66M264 233l-7 67M375 231l22 68M477 230l47 66" />
          <path
            d="m91 207 70-1m16 0 59-1m15 0 65-1m16 0 67-1m18 0 53-1"
            stroke="#899A91"
          />
        </g>
        {/* Old eaves: highlights follow a single upper-left light source. */}
        <path d="m59 71 420-10 76 45-11 11-68-40-417 9Z" fill="#60716F" />
        <path d="m59 71 420-10 76 45-11 2-67-37L59 80Z" fill="#8C9A91" />
        <path
          d="m75 84 402-8 58 34"
          stroke="#526663"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <g stroke="#A8B0A3" strokeWidth="1.4" opacity=".7">
          <path d="m114 70 2 9m42-10 2 9m42-10 2 9m42-10 2 9m42-10 2 9m42-10 2 9m42-10 2 9m42-10 2 9m42-9 2 9" />
        </g>
        {/* Exposed blue-grey brick and small plaster imperfections. */}
        <g fill="#B9C1B5">
          <path d="M84 167h24v9H84zm14 11h24v8H98zm-16 11h23v7H82z" />
          <path d="M447 182h21v8h-21zm-12 11h33v7h-33z" />
        </g>
        <path
          d="m291 93-4 15 5 5-4 15m171-32-4 8 2 6"
          stroke="#C9C7B8"
          strokeWidth="1.3"
          strokeLinecap="round"
        />

        {/* Door recess; pale left edge, quiet cool interior. */}
        <path d="m147 102 99-2v107l-99 3Z" fill="#B9B6A4" />
        <path d="m153 108 88-2v99l-88 3Z" fill="#534E43" />
        <path d="m157 110 40-1v96l-40 1Z" fill="#89715A" />
        <path d="m199 109 38-1v96l-38 1Z" fill="#79634F" />
        <g stroke="#A18A6E" strokeWidth="1.4">
          <path d="m164 115 1 84m12-84 1 84m12-84 1 84m15-84 1 84m12-84 1 84m12-84 1 84" />
        </g>
        <path d="m153 108 88-2" stroke="#E0D3B8" strokeWidth="3" />
        <path
          d="m190 149 1 12m15-12v12"
          stroke="#3D453D"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="191" cy="153" r="3.3" stroke="#B69A63" strokeWidth="1.4" />
        <circle cx="206" cy="153" r="3.3" stroke="#B69A63" strokeWidth="1.4" />
        <path d="m141 208 108-2 9 10-126 3Z" fill="#A8AEA0" />
        <path d="m132 219 126-3v6l-126 4Z" fill="#7F8F85" />
        <path
          d="m139 211 104-2"
          stroke="#D4D4BF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="m131 228 133-4 13 11-159 5Z" fill="#B7BDAE" />

        {/* Window chapter: paper panes are always legible, shutter changes pose. */}
        <g data-scene-token="window" data-restored={present(2)}>
          <path d="m356 104 94-1v75l-94 2Z" fill="#B6B8A9" />
          <path d="m363 110 79-1v62l-79 2Z" fill="#DDDCCA" />
          <path
            d="m367 114 70-1v54l-70 2Z"
            fill={present(7) ? `url(#${id('paperLight')})` : '#E8E3CF'}
          />
          <g stroke="#8D8067" strokeWidth="2.1">
            <path d="m384 114 1 54m18-55 1 54m17-54 1 54m-54-36 69-1m-69 19 69-1" />
          </g>
          <path
            d="m359 106-13 7v64l13-4Z"
            fill={present(2) ? '#7F7960' : '#92927D'}
            transform={present(2) ? 'translate(-7 0)' : undefined}
          />
          <path d="m447 104 16 10v63l-16-5Z" fill="#827960" />
          <path
            d="m350 113 1 55m102-55 3 54"
            stroke="#A59B7E"
            strokeWidth="1.5"
          />
          <path d="m352 180 99-3 7 5-107 3Z" fill="#8D9988" />
          {!present(2) && (
            <path d="m370 118 10 8-5 10" stroke="#C7C3AB" strokeWidth="1.2" />
          )}
        </g>

        <g data-scene-token="windowLight" data-restored={present(7)}>
          {present(7) && (
            <>
              <path
                d="m366 173 72-2 31 54-126 1Z"
                fill="#EBC889"
                opacity=".15"
              />
              <path
                d="m374 229 83-1 26 17-124 2Z"
                fill="#E8C98B"
                opacity=".19"
              />
              <path d="M392 153h9v12h-9z" fill="#8C8266" />
              <path d="m390 154 5-6 8 6Z" fill="#AEA17D" />
              <path d="M425 156h8v9h-8z" fill="#B69561" />
            </>
          )}
        </g>

        {/* A real little copper lamp, not a badge or UI button. */}
        <g data-scene-token="doorLight" data-restored="true">
          <ellipse
            className={
              atmosphere !== 'day' ? 'courtyard-lamp-breath' : undefined
            }
            cx="128"
            cy="151"
            rx="39"
            ry="43"
            fill={`url(#${id('lampGlow')})`}
          />
          <path
            d="M124 108v-6h11"
            stroke="#6E7463"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path d="m117 119 8-9 10 8-3 4-13 1Z" fill="#A27F46" />
          <path d="m119 122 13-1-1 21-10 1Z" fill="#F4D28D" />
          <path
            d="m119 122 13-1-1 21-10 1Z"
            stroke="#92733F"
            strokeWidth="1.6"
          />
          <path d="m125 123 1 18" stroke="#FFEAC1" strokeWidth="2" />
          <path d="m119 143 14-1-4 5h-6Z" fill="#8D754A" />
          <path d="m119 209 24-1 14 10-43 2Z" fill="#EAC98F" opacity=".28" />
        </g>

        {/* Low bench and two chairs form a conversation space in the foreground. */}
        <ellipse
          cx="361"
          cy="267"
          rx="109"
          ry="19"
          fill="#6D7C6F"
          opacity=".10"
        />
        <g
          data-scene-token="chairs"
          data-restored={present(3)}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g transform={present(3) ? 'translate(0 0)' : 'translate(-7 2)'}>
            <path d="m285 212 25-4 3 34-25 5Z" fill="#9A8060" />
            <path d="m289 216 17-3 1 15-17 4Z" fill="#D5D3BD" />
            <path d="m286 239 30-4 14 10-32 6Z" fill="#A68B68" />
            <path
              d="m290 247-1 23m36-25 3 20m-23-15 1 23"
              stroke="#75654C"
              strokeWidth="3"
            />
            <path
              d="m288 211 1 29m22-32 2 26"
              stroke="#7D6C51"
              strokeWidth="2.7"
            />
            <path d="m287 239 28-4" stroke="#C0A57E" strokeWidth="1.5" />
          </g>
          <g
            transform={
              present(3)
                ? 'translate(0 0)'
                : 'translate(32 -10) rotate(13 423 243)'
            }
          >
            <path d="m418 207 25 5-4 34-25-5Z" fill="#8B765A" />
            <path d="m421 213 17 4-2 15-17-4Z" fill="#CBCDB7" />
            <path d="m411 235 29 5-12 12-32-7Z" fill="#A68B68" />
            <path
              d="m399 245-3 22m34-17 1 22m6-28 4 21"
              stroke="#75654C"
              strokeWidth="3"
            />
            <path
              d="m419 209-4 26m28-22-4 26"
              stroke="#75654C"
              strokeWidth="2.7"
            />
            <path d="m412 236 26 4" stroke="#C0A57E" strokeWidth="1.5" />
          </g>
        </g>
        {/* Table: a single patch seam is enough to make the repair visible. */}
        <path
          d="m335 242-4 36m54-36 5 33m-38-30 1 38"
          stroke="#756A51"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="m327 229 52-5 27 15-54 8-27-12Z" fill="#AA916F" />
        <path d="m327 235 25 12 54-8v5l-54 8-25-12Z" fill="#8B775C" />
        <g data-scene-token="mendedCloth" data-restored={present(4)}>
          <path
            d="m336 230 40-4 20 12-40 7-19-6Z"
            fill={present(4) ? '#E7DDC3' : '#CECEB9'}
          />
          <path
            d="m355 244 38-6-2 13-34 6Z"
            fill={present(4) ? '#D9CDB1' : '#BABEAA'}
          />
          {present(4) ? (
            <path
              d="m369 230 1 5 9 4-4 9m-8-16 5-1m-2 5 5-2m1 5 6-1m-7 7 5 1"
              stroke="#8C9B7E"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="m370 230 1 5 7 3-4 9"
              stroke="#AAA68E"
              strokeWidth="1.6"
              strokeDasharray="3 3"
            />
          )}
        </g>
        <ellipse cx="356" cy="235" rx="6" ry="2.5" fill="#EDE4CA" />
        <path d="M351 233v4c0 3 9 3 10 0v-4" fill="#ECE3C9" />
        <ellipse cx="356" cy="233" rx="5" ry="2" fill="#B5AF92" />
        {present(7) && (
          <g
            transform={count >= 6 && count < 12 ? 'translate(31 9)' : undefined}
          >
            <path d="M379 231v4c0 3 8 3 9 0v-4" fill="#D0D4C0" />
            <ellipse cx="383.5" cy="231" rx="4.5" ry="1.8" fill="#8C9A83" />
          </g>
        )}

        <g data-scene-token="mint" data-restored={present(1)}>
          <ellipse
            cx="478"
            cy="235"
            rx="20"
            ry="5"
            fill="#6D7C6F"
            opacity=".15"
          />
          <path d="m464 213 28-1-5 23-18 1Z" fill="#B89273" />
          <path d="m464 213 28-1v5l-28 1Z" fill="#CBA485" />
          <ellipse cx="478" cy="213" rx="14" ry="3.6" fill="#756C55" />
          <path
            d="m478 214-1-20m1 13-8-9m9 6 7-12"
            stroke="#70856A"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {present(1) ? (
            <g>
              <path
                d="M477 199c-12 0-15-7-12-9 8-2 13 2 12 9Z"
                fill="#8D9C77"
              />
              <path
                d="M479 202c1-12 10-15 13-11 1 8-5 13-13 11Z"
                fill="#6E876B"
              />
              <path d="M477 193c-9-4-10-12-5-14 6 1 9 7 5 14Z" fill="#809570" />
              <path
                d="M478 190c-1-10 4-15 8-12 4 7-1 11-8 12Z"
                fill="#A1AD82"
              />
              <path
                d="M473 207c-10 0-13-5-10-8 7-1 11 2 10 8Z"
                fill="#71876D"
              />
            </g>
          ) : (
            <path
              d="m470 200-6-3m20 0 4-4"
              stroke="#9B9B7D"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
        </g>

        <g data-scene-token="windChime" data-restored={present(5)}>
          {present(5) ? (
            <g
              className={
                atmosphere !== 'rain' ? 'courtyard-chime-sway' : undefined
              }
            >
              <path d="M314 82v14" stroke="#8A8970" strokeWidth="1.2" />
              <path d="M305 109c0-16 17-17 18-1l-18 1Z" fill="#A6B4AA" />
              <path
                d="M307 105c1-7 5-10 8-8"
                stroke="#D1D8CB"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path d="m305 109 18-1" stroke="#7B8E81" strokeWidth="1.5" />
              <path d="m314 109 1 18" stroke="#8F9077" strokeWidth="1" />
              <path d="m310 124 10-1-1 19-8-1Z" fill="#D8C8A4" />
              <path d="m314 126 1 11" stroke="#B7AB88" strokeWidth=".8" />
            </g>
          ) : (
            <path d="M314 82v10" stroke="#9D9B82" strokeWidth="1.1" />
          )}
        </g>
        <g data-scene-token="doorNote" data-restored={present(6)}>
          {present(6) ? (
            <>
              <path d="m258 147 31 2-1 31-30-1Z" fill="#B4B39E" opacity=".35" />
              <path d="m257 145 30 2-1 30-29-1Z" fill="#F6EBD1" />
              <path d="m283 147 4 0-1 5Z" fill="#D8CAA9" />
              <circle cx="260" cy="148" r="1.3" fill="#9C8C68" />
            </>
          ) : (
            <path d="m260 149 10 1" stroke="#C0BCA5" strokeWidth="1.2" />
          )}
        </g>

        <CourtyardLifeDetails
          count={count}
          restoringToken={reduced ? null : lifeRestoringToken}
        />
        {atmosphere === 'rain' && (
          <g aria-hidden="true">
            <path
              d="m119 270 64-2m38 12 83-2m101-5 76-2"
              stroke="#E6EFE3"
              strokeWidth="2"
              opacity=".55"
            />
            <g
              className="courtyard-rain-lines"
              stroke="#DAE9DF"
              strokeWidth="1.5"
              opacity=".6"
            >
              {Array.from({length: 12}, (_, i) => (
                <path
                  key={i}
                  d={`m${32 + i * 48} ${32 + (i % 4) * 58} -9 29`}
                />
              ))}
            </g>
          </g>
        )}
        {!reduced && interaction && (
          <g
            key={interaction.serial}
            className="courtyard-touch-feedback"
            data-interaction-token={interaction.token}
            aria-hidden="true"
          >
            <ellipse
              cx={touchLocations[interaction.token][0]}
              cy={touchLocations[interaction.token][1]}
              rx="18"
              ry="12"
              stroke="#D9B773"
              strokeWidth="2"
            />
          </g>
        )}
        {/* Restrained moss, foreground leaves; never under interactive text. */}
        <g fill="#7D927A" opacity=".78">
          <path d="m77 225 20-2 10 5-29 2Zm31-6 13-1 5 4-20 2Zm347-6 14-1 7 3-22 3Z" />
          <path d="m100 271 19-2 6 4-25 3Zm402 13 25-1 8 4-31 2Z" />
        </g>
        <path
          d="M35 320c8-29 8-42 2-67m2 26-18-14m19 29 20-19"
          stroke="#778F76"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M37 273c-18 0-24-11-19-17 12-1 21 6 19 17Zm4 22c17-2 26-13 21-18-12 0-21 9-21 18Zm-7-36c-12-8-12-20-5-22 8 4 10 14 5 22Z"
          fill="#8EA080"
        />
        <path
          d="M558 320c-1-18 4-31 16-43m-13 26-12-12"
          stroke="#8C9B7A"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M563 296c2-15 12-21 17-16 2 10-6 17-17 16Zm-4 12c-12-1-18-10-14-14 10-1 15 6 14 14Z"
          fill="#ABB18C"
        />
        <path
          d="M0 316c89-7 148-5 211-1s139 4 201-1 131-3 188 3v3H0Z"
          fill="#D5D8C5"
          opacity=".55"
        />
      </g>
    </svg>
  )
}
