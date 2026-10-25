import {useEffect, useState} from 'react'
import type {CSSProperties} from 'react'
import type {Language} from '../../utils/gameplay'
import {useReducedMotion} from './useReducedMotion'
import './RulesDemo.scss'

type Kind = 'row' | 'column' | 'box'

/** A self-contained lesson: its example never touches the saved game. */
export function RulesDemo({kind, lang, body}: {kind: Kind; lang: Language; body: string}) {
  const [step, setStep] = useState(1)
  const [playing, setPlaying] = useState(false)
  const reducedMotion = useReducedMotion()
  const say = (zh: string, en: string) => lang === 'zh' ? zh : en
  const unit = say(kind === 'row' ? '行' : kind === 'column' ? '列' : '宫', kind === 'row' ? 'row' : kind === 'column' ? 'column' : 'box')
  const motionReason = say('减少动态效果已开启；可手动切步。', 'Reduce Motion on; use steps. ')
  const captions = [
    say(`1 · 找到高亮的九格${unit}。`, `1 · Find the nine highlighted cells in this ${unit}.`),
    say('2 · 已有 1～8，观察这八个数字。', '2 · Observe the eight digits already here: 1–8.'),
    say('3 · 1～9 各一次，缺少的是 9。', '3 · Each digit appears once; 9 is missing.'),
    say('4 · 选中中央空格，准备填 9。', '4 · Select the empty center cell for 9.'),
    say(`5 · 填入 9，这一${unit}完成；全盘仍需检查。`, `5 · Fill 9 to complete this ${unit} only.`),
  ]
  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setPlaying(false)
    }
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden)
  }, [])
  useEffect(() => {
    if (reducedMotion) setPlaying(false)
  }, [reducedMotion])
  useEffect(() => {
    if (!playing || reducedMotion || document.hidden) return
    const timer = setTimeout(() => {
      setStep(step + 1)
      if (step + 1 === 5) setPlaying(false)
    }, 1600)
    return () => clearTimeout(timer)
  }, [playing, step, reducedMotion])
  return (
    <div className="rules-demo" data-demo-step={step} data-demo-playing={playing}>
      <div className="rules-diagram rules-grid" data-kind={kind} aria-hidden="true">
        {Array.from({length: 81}, (_, index) => {
          const row = Math.floor(index / 9), column = index % 9
          const highlighted = kind === 'row' ? row === 4 : kind === 'column' ? column === 4 : row >= 3 && row < 6 && column >= 3 && column < 6
          const target = row === 4 && column === 4
          const value = (row * 3 + Math.floor(row / 3) + column) % 9 + 1
          const unitPosition = kind === 'row' ? column : kind === 'column' ? row : (row - 3) * 3 + column - 3
          const scanOrder = unitPosition > 4 ? unitPosition - 1 : unitPosition
          return <span key={index} data-row={row} data-column={column} style={highlighted && !target ? {'--demo-order': scanOrder} as CSSProperties : undefined} className={`${highlighted ? 'is-highlight' : ''} ${highlighted && !target && step === 2 ? 'demo-observed' : ''} ${target && step >= 4 ? 'demo-selected' : ''} ${target && step === 5 ? 'demo-filled' : ''} ${column === 2 || column === 5 ? 'box-right' : ''} ${row === 2 || row === 5 ? 'box-bottom' : ''}`}>{highlighted && (!target || step === 5) ? value : ''}</span>
        })}
      </div>
      <p className="dialog-copy demo-body">{body}</p>
      <div className="demo-caption" id={`demo-caption-${kind}`}>
        {captions.map((caption, index) => <p key={index} className="demo-caption-size" aria-hidden="true">{reducedMotion && motionReason}{caption}</p>)}
        <p className="demo-caption-active" role="status" aria-live="polite" aria-atomic="true">{reducedMotion && motionReason}{captions[step - 1]}</p>
      </div>
      <div className="demo-controls">
        <div className="demo-steps" role="group" aria-label={say('演示步骤', 'Demonstration steps')}>
          {captions.map((_, index) => <button type="button" key={index} data-demo-step-button={index + 1} aria-label={say(`第 ${index + 1} 步`, `Step ${index + 1}`)} aria-pressed={step === index + 1} onClick={() => {setPlaying(false); setStep(index + 1)}}>{index + 1}</button>)}
        </div>
        <button type="button" className="demo-toggle" data-demo-toggle disabled={reducedMotion} aria-describedby={`demo-caption-${kind}`} aria-label={playing ? say('暂停演示', 'Pause demo') : say('观看演示', 'Play demo')} onClick={() => {
          if (playing) setPlaying(false)
          else if (!document.hidden) {
            if (step === 5) setStep(1)
            setPlaying(true)
          }
        }}>{playing ? say('暂停演示', 'Pause demo') : say('观看演示', 'Play demo')}</button>
      </div>
    </div>
  )
}
