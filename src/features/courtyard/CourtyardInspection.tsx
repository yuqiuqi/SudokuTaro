import {useState} from 'react'
import type {Language} from '../../utils/gameplay'
import {
  courtyardObjects,
  objectIsAvailable,
  type CourtyardObjectId,
} from './objects'
type Props = {
  lang: Language
  unlockedThrough: number
  favorite: string | null
  onFavorite: (id: string | null) => void
  onInspect: (id: CourtyardObjectId) => void
  onReadChapter: (index: number) => void
}
export function CourtyardInspection({
  lang,
  unlockedThrough,
  favorite,
  onFavorite,
  onInspect,
  onReadChapter,
}: Props) {
  const [selected, setSelected] = useState<string | null>(() =>
    favorite && objectIsAvailable(favorite, unlockedThrough) ? favorite : null,
  )
  const en = lang === 'en',
    object = courtyardObjects.find(
      (o) => o.id === selected && o.chapter <= unlockedThrough,
    )
  return (
    <section
      className="courtyard-objects"
      aria-label={en ? 'Objects and memories' : '院中物件与回忆'}
    >
      <h2>{en ? 'Things we kept' : '留下的物件'}</h2>
      <div className="object-list">
        {courtyardObjects
          .filter((o) => o.chapter <= unlockedThrough)
          .map((o) => (
            <button
              type="button"
              key={o.id}
              data-courtyard-object={o.id}
              aria-pressed={selected === o.id}
              onClick={() => {
                setSelected(o.id)
                onInspect(o.id)
              }}
            >
              {o.name[lang]}
              {favorite === o.id && (
                <span aria-label={en ? 'Favorite' : '偏爱'}> · ♥</span>
              )}
            </button>
          ))}
      </div>
      {object && (
        <div
          className="object-inspection"
          data-courtyard-inspection={object.id}
        >
          <h3>{object.name[lang]}</h3>
          <p>{object.description[lang]}</p>
          <div className="inspection-actions">
            <button
              type="button"
              data-courtyard-favorite
              aria-pressed={favorite === object.id}
              onClick={() =>
                onFavorite(favorite === object.id ? null : object.id)
              }
            >
              {favorite === object.id
                ? en
                  ? 'Kept in view · remove'
                  : '留在眼前 · 取消'
                : en
                  ? 'Keep in view'
                  : '留在眼前'}
            </button>
            <button type="button" onClick={() => onReadChapter(object.chapter)}>
              {en ? 'Read its chapter' : '重读这一篇'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
