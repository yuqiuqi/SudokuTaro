import type {Language} from '../../utils/gameplay'
import type {CourtyardWorld} from './world'
type Props = {
  lang: Language
  world: CourtyardWorld
  onAtmosphere: (value: string) => void
  onMotion: (value: string) => void
}
export function CourtyardWorldControls({
  lang,
  world,
  onAtmosphere,
  onMotion,
}: Props) {
  const en = lang === 'en'
  return (
    <section
      className="world-controls"
      aria-label={en ? 'Make this courtyard yours' : '按你的心意看院子'}
    >
      <div
        className="world-atmospheres"
        role="group"
        aria-label={en ? 'Courtyard atmosphere' : '庭院氛围'}
      >
        {(['day', 'dusk', 'rain'] as const).map((a, i) => (
          <button
            type="button"
            key={a}
            data-courtyard-atmosphere={a}
            aria-pressed={world.atmosphere === a}
            onClick={() => onAtmosphere(a)}
          >
            {
              (en
                ? ['Daylight', 'Dusk', 'Gentle rain']
                : ['晴日', '暮色', '细雨'])[i]
            }
          </button>
        ))}
      </div>
      <button
        type="button"
        className="world-motion"
        data-courtyard-motion
        aria-pressed={world.motion === 'still'}
        onClick={() => onMotion(world.motion === 'still' ? 'ambient' : 'still')}
      >
        {world.motion === 'still'
          ? en
            ? 'Still courtyard · on'
            : '静止庭院 · 已开启'
          : en
            ? 'Still courtyard · off'
            : '静止庭院 · 未开启'}
      </button>
    </section>
  )
}
