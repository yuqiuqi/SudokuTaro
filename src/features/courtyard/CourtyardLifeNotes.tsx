import type {Language} from '../../utils/gameplay'
import type {CourtyardLife} from './life'
import {lifeNotes} from './lifeNotes'
type Props = {
  lang: Language
  life: CourtyardLife
  current: number | null
  onOpen: (index: number) => void
}
export function CourtyardLifeNotes({lang, life, current, onOpen}: Props) {
  const en = lang === 'en',
    count = life.creditedSessionIds.length
  if (current !== null) {
    const n = lifeNotes[current]
    return (
      <article data-life-note={n.id}>
        <div className="chapter-number">
          {String(current + 1).padStart(2, '0')} / 12
        </div>
        <p className="chapter-body life-note-body">{n.body[lang]}</p>
        {current === 11 && (
          <p className="volume-end">
            {en
              ? 'This collection is complete. The courtyard, its memories, and your puzzles are yours to return to.'
              : '这一册已收齐。院子、回忆和数独，仍可随时回来。'}
          </p>
        )}
      </article>
    )
  }
  return (
    <section className="courtyard-life-index">
      <p className="courtyard-intro">
        {en
          ? `Courtyard notes · ${count} / 12. Each new completed puzzle after the main story brings one note and a small sign of life.`
          : `院中日常 · ${count} / 12。主线之后，每次新通关留下一张生活笺，让院子多一点生活的痕迹。`}
      </p>
      {count === 0 && (
        <p className="life-empty">
          {en
            ? 'The next new puzzle you complete brings the first note. There is no need to finish reading the main story first.'
            : '下一次新通关，便会留下一张生活笺。不必先读完主线正文。'}
        </p>
      )}
      {count === 12 && (
        <p className="volume-end">
          {en
            ? 'This collection is complete. Read again whenever you like.'
            : '这一册已收齐，随时可以回来重读。'}
        </p>
      )}
      <div className="chapter-list">
        {lifeNotes.map((n, i) => (
          <button
            type="button"
            key={n.id}
            data-life-note={n.id}
            disabled={i >= count}
            onClick={() => onOpen(i)}
          >
            <span className="chapter-list-number">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{n.title[lang]}</span>
            <small>
              {i >= count
                ? en
                  ? 'After a new win'
                  : '新通关后留下'
                : life.readNoteIds.includes(n.id)
                  ? en
                    ? 'Read again'
                    : '重读'
                  : en
                    ? 'Unread'
                    : '未读'}
            </small>
          </button>
        ))}
      </div>
    </section>
  )
}
