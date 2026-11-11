import {useEffect, useRef, useState} from 'react'
import type {Language} from '../../utils/gameplay'
import type {CourtyardProgress} from './story'
import type {CourtyardLife} from './life'
import type {CourtyardWorld} from './world'
import type {CourtyardObjectId} from './objects'
import type {CourtyardPresentation} from './useCourtyardState'
import {chapters} from './chapters'
import {lifeNotes} from './lifeNotes'
import CourtyardScene from './CourtyardScene'
import {CourtyardWorldControls} from './CourtyardWorldControls'
import {CourtyardInspection} from './CourtyardInspection'
import {CourtyardLifeNotes} from './CourtyardLifeNotes'
import {LanguageSwitch} from '../../pages/index/LanguageSwitch'
import {useReducedMotion} from '../../pages/index/useReducedMotion'
import './CourtyardStory.scss'
type Screen =
  | {kind: 'courtyard'}
  | {kind: 'chapter'; index: number}
  | {kind: 'life'; index: number | null}
type Props = {
  lang: Language
  progress: CourtyardProgress
  life: CourtyardLife
  world: CourtyardWorld
  onRead: (id: string) => void
  onReadLife: (id: string) => void
  onMode: (mode: 'story' | 'sudoku') => void
  onAtmosphere: (value: string) => void
  onMotion: (value: string) => void
  onFavorite: (id: string | null) => void
  preparePresentation: () => CourtyardPresentation
  onLanguage: (lang: Language) => void
  onClose: () => void
  saveFailed?: boolean
}
export function CourtyardStory({
  lang,
  progress,
  life,
  world,
  onRead,
  onReadLife,
  onMode,
  onAtmosphere,
  onMotion,
  onFavorite,
  preparePresentation,
  onLanguage,
  onClose,
  saveFailed = false,
}: Props) {
  const [screen, setScreen] = useState<Screen>({kind: 'courtyard'}),
    [hidden, setHidden] = useState(document.hidden)
  const [presentation, setPresentation] = useState<CourtyardPresentation>({
    mainToken: null,
    lifeToken: null,
  })
  const [interaction, setInteraction] = useState<{
    token: CourtyardObjectId
    serial: number
  } | null>(null)
  const interactionSerial = useRef(0),
    reader = useRef<HTMLDivElement>(null),
    reduced = useReducedMotion(),
    en = lang === 'en'
  const previousScreen = useRef(screen)
  const still =
    reduced || hidden || world.motion === 'still' || screen.kind !== 'courtyard'
  useEffect(() => {
    setPresentation(preparePresentation())
  }, [preparePresentation])
  useEffect(() => {
    const update = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  useEffect(() => {
    if (still) {
      setPresentation({mainToken: null, lifeToken: null})
      setInteraction(null)
    }
  }, [still])
  useEffect(() => {
    if (!interaction) return
    const id = setTimeout(() => setInteraction(null), 260)
    return () => clearTimeout(id)
  }, [interaction])
  useEffect(() => {
    if (screen.kind === 'chapter') onRead(chapters[screen.index].id)
    if (screen.kind === 'life' && screen.index !== null)
      onReadLife(lifeNotes[screen.index].id)
    reader.current?.scrollTo(0, 0)
    // A boundary navigation button may become disabled: transfer focus first.
    if (screen.kind !== 'courtyard' || screen !== previousScreen.current)
      reader.current?.focus({preventScroll: true})
    previousScreen.current = screen
  }, [screen, lang])
  const openChapter = (index: number) => setScreen({kind: 'chapter', index})
  const lifeCount = life.creditedSessionIds.length
  const chapter = screen.kind === 'chapter' ? chapters[screen.index] : null
  const note =
    screen.kind === 'life' && screen.index !== null
      ? lifeNotes[screen.index]
      : null
  const title =
    chapter?.title[lang] ??
    note?.title[lang] ??
    (screen.kind === 'life'
      ? en
        ? 'Life in the courtyard'
        : '院中日常'
      : en
        ? 'A place to return to'
        : '给回来的人，留个座')
  return (
    <div className="courtyard-story">
      <div className="courtyard-top">
        <LanguageSwitch lang={lang} onChange={onLanguage} />
        <button
          type="button"
          className="text-button close-button"
          onClick={onClose}
          aria-label={en ? 'Close' : '关闭'}
        >
          ×
        </button>
      </div>
      <div className="courtyard-heading">
        <span className="eyebrow">
          {en ? 'A LIGHT IN THE COURTYARD' : '院子留一盏灯'}
        </span>
        <h1 id="dialog-title">{title}</h1>
      </div>
      <div
        className="story-reader"
        data-story-reader
        data-life-reader={screen.kind === 'life' ? true : undefined}
        tabIndex={0}
        ref={reader}
        aria-label={
          screen.kind === 'life'
            ? en
              ? 'Courtyard notes reading area'
              : '生活笺阅读区'
            : en
              ? 'Story reading area'
              : '故事阅读区'
        }
      >
        {saveFailed && (
          <p className="courtyard-save-warning" role="status">
            {en
              ? 'Changes could not be saved in this browser. You can continue during this visit.'
              : '当前浏览器未能保存更改，本次仍可继续。'}
          </p>
        )}
        {chapter && screen.kind === 'chapter' ? (
          <article data-story-chapter={chapter.id}>
            <div className="chapter-number">
              {String(screen.index + 1).padStart(2, '0')} / 08
            </div>
            <p className="chapter-body">{chapter.body[lang]}</p>
            {screen.index === 7 && (
              <p className="volume-end">
                {en
                  ? 'End of Volume One. The courtyard is here whenever you wish to read again. Sudoku remains freely yours.'
                  : '第一卷完。院子在这里，随时可以回来重读。数独仍可自由继续。'}
              </p>
            )}
          </article>
        ) : screen.kind === 'life' ? (
          <CourtyardLifeNotes
            lang={lang}
            life={life}
            current={screen.index}
            onOpen={(index) => setScreen({kind: 'life', index})}
          />
        ) : (
          <>
            <div data-courtyard-scene={progress.unlockedThrough}>
              <CourtyardScene
                lang={lang}
                stage={progress.unlockedThrough}
                reduced={still}
                atmosphere={world.atmosphere}
                lifeCount={lifeCount}
                restoringToken={presentation.mainToken}
                lifeRestoringToken={presentation.lifeToken}
                interaction={interaction}
              />
            </div>
            <CourtyardWorldControls
              lang={lang}
              world={world}
              onAtmosphere={onAtmosphere}
              onMotion={onMotion}
            />
            <CourtyardInspection
              lang={lang}
              unlockedThrough={progress.unlockedThrough}
              favorite={world.favoriteObjectId}
              onFavorite={onFavorite}
              onReadChapter={openChapter}
              onInspect={(token) => {
                if (!still)
                  setInteraction({token, serial: ++interactionSerial.current})
              }}
            />
            {progress.unlockedThrough === 7 && (
              <button
                type="button"
                className="life-open-button"
                data-courtyard-life-open
                onClick={() => setScreen({kind: 'life', index: null})}
              >
                {en
                  ? `Life in the courtyard · ${lifeCount} / 12`
                  : `院中日常 · ${lifeCount} / 12`}
                <span>
                  {lifeCount === 12
                    ? en
                      ? 'Collection complete'
                      : '这一册已收齐'
                    : en
                      ? 'Open the notes'
                      : '翻开生活笺'}
                </span>
              </button>
            )}
            <p className="courtyard-intro">
              {en
                ? 'Begin restoring from this moment. Your past records stay intact. The first chapter is free; each new completed puzzle opens one more, through eight chapters.'
                : '从此刻开始修复，过去的纪录会完整保留。第一篇免费，每次新通关开放一篇，共八篇。'}
            </p>
            {progress.unlockedThrough >= 6 && (
              <p className="door-note">
                {en
                  ? 'Let us know before you come. We’ll save you a seat.'
                  : '来前说一声，给你留座。'}
              </p>
            )}
            <div className="chapter-list">
              {chapters.map((c, i) => (
                <button
                  type="button"
                  key={c.id}
                  data-story-chapter={c.id}
                  disabled={i > progress.unlockedThrough}
                  onClick={() => openChapter(i)}
                >
                  <span className="chapter-list-number">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{c.title[lang]}</span>
                  <small>
                    {i > progress.unlockedThrough
                      ? en
                        ? 'After a new win'
                        : '新通关后开放'
                      : progress.readChapterIds.includes(c.id)
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
          </>
        )}
      </div>
      <div className="story-footer">
        {screen.kind === 'chapter' ? (
          <>
            <button
              type="button"
              className="secondary-button"
              data-story-previous
              disabled={screen.index === 0}
              onClick={() => openChapter(Math.max(0, screen.index - 1))}
            >
              {en ? 'Previous' : '上一篇'}
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => setScreen({kind: 'courtyard'})}
            >
              {en ? 'Courtyard' : '回院子'}
            </button>
            <button
              type="button"
              className="primary-button"
              data-story-next
              disabled={screen.index === progress.unlockedThrough}
              onClick={() =>
                openChapter(
                  Math.min(progress.unlockedThrough, screen.index + 1),
                )
              }
            >
              {en ? 'Next' : '下一篇'}
            </button>
          </>
        ) : screen.kind === 'life' ? (
          <>
            {screen.index !== null && (
              <button
                type="button"
                className="secondary-button"
                data-life-previous
                disabled={screen.index === 0}
                onClick={() =>
                  setScreen({
                    kind: 'life',
                    index: Math.max(0, (screen.index ?? 0) - 1),
                  })
                }
              >
                {en ? 'Previous' : '上一笺'}
              </button>
            )}
            <button
              type="button"
              className="text-button"
              data-life-back
              onClick={() =>
                setScreen(
                  screen.index === null
                    ? {kind: 'courtyard'}
                    : {kind: 'life', index: null},
                )
              }
            >
              {screen.index === null
                ? en
                  ? 'Courtyard'
                  : '回院子'
                : en
                  ? 'All notes'
                  : '生活笺目录'}
            </button>
            {screen.index !== null && (
              <button
                type="button"
                className="primary-button"
                data-life-next
                disabled={screen.index >= lifeCount - 1}
                onClick={() =>
                  setScreen({
                    kind: 'life',
                    index: Math.min(lifeCount - 1, (screen.index ?? 0) + 1),
                  })
                }
              >
                {en ? 'Next' : '下一笺'}
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            className="secondary-button"
            data-story-mode
            aria-pressed={progress.mode === 'sudoku'}
            onClick={() =>
              onMode(progress.mode === 'story' ? 'sudoku' : 'story')
            }
          >
            {progress.mode === 'story'
              ? en
                ? 'Story notices on · switch off'
                : '故事通知已开启 · 只玩数独'
              : en
                ? 'Notices off · turn on'
                : '故事通知已关闭 · 开启故事'}
          </button>
        )}
      </div>
    </div>
  )
}
