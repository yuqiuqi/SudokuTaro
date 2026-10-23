import type {Language} from '../../utils/gameplay'
import type {TutorialDiagram} from '../../utils/tutorial'
import {GameIcon} from './GameIcon'

export function RulesDiagram({kind, lang}: {kind: TutorialDiagram; lang: Language}) {
  const say = (zh: string, en: string) => lang === 'zh' ? zh : en
  if (kind === 'row' || kind === 'column' || kind === 'box') {
    return (
      <div className="rules-diagram rules-grid" data-kind={kind} aria-hidden="true">
        {Array.from({length: 81}, (_, index) => {
          const row = Math.floor(index / 9), column = index % 9
          const highlighted = kind === 'row' ? row === 4 : kind === 'column' ? column === 4 : row >= 3 && row < 6 && column >= 3 && column < 6
          const value = (row * 3 + Math.floor(row / 3) + column) % 9 + 1
          return <span key={index} data-row={row} data-column={column} className={`${highlighted ? 'is-highlight' : ''} ${column === 2 || column === 5 ? 'box-right' : ''} ${row === 2 || row === 5 ? 'box-bottom' : ''}`}>{highlighted ? value : ''}</span>
        })}
      </div>
    )
  }
  return (
    <div className={`rules-diagram rules-example rules-example-${kind}`} data-kind={kind} aria-hidden="true">
      {kind === 'input' && <>
        <div className="example-cells"><span>5</span><span className="example-selected">3</span></div>
        <div className="example-labels"><span>{say('题目给定', 'Given')}</span><span>{say('自己填写', 'Your entry')}</span></div>
        <p>{say('选空格 → 点 3', 'Select cell → Tap 3')}</p>
      </>}
      {kind === 'tools' && <>
        <div className="example-notes">1 · 4 · 7</div>
        <div className="example-tools">
          <span><GameIcon name="notes" />{say('笔记', 'Notes')}</span>
          <span><GameIcon name="erase" />{say('擦除', 'Erase')}</span>
          <span><GameIcon name="undo" />{say('撤销', 'Undo')}</span>
        </div>
      </>}
      {kind === 'hints' && <>
        <div className="example-hint-steps"><span>1<br />{say('定位', 'Locate')}</span><span>2<br />{say('提问', 'Ask')}</span><span>3<br />{say('解释', 'Explain')}</span></div>
        <div className="example-keys"><span className="example-disabled">5</span><span>3</span></div>
      </>}
      {kind === 'new-game' && <>
        <strong>{say('新开一局', 'New game')}</strong>
        <span>{say('选择难度', 'Choose level')}</span>
        <span className="example-saved"><GameIcon name="check" />{say('自动保存', 'Auto saved')}</span>
        <span>中文 / English</span>
      </>}
    </div>
  )
}
