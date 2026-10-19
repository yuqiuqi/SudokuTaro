type IconName =
  | 'undo'
  | 'erase'
  | 'notes'
  | 'hint'
  | 'close'
  | 'check'
  | 'info'
  | 'warning'
const paths: Record<IconName, string> = {
  undo: 'M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 12',
  erase:
    'm15 3 6 6a2 2 0 0 1 0 3l-8 8H7l-5-5a2 2 0 0 1 0-3L12 3a2 2 0 0 1 3 0ZM7 8l9 9M13 20h9',
  notes: 'm15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14v6Z',
  hint: 'M9 18h6M10 22h4M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 4H9c0-2 0-3-1-4Z',
  close: 'm6 6 12 12M18 6 6 18',
  check: 'm5 12 4 4L19 6',
  info: 'M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  warning: 'm12 3 10 18H2L12 3ZM12 9v5M12 17h.01',
}
/** Shared outline icons keep tool labels visible and screen-reader names unchanged. */
export function GameIcon({name}: {name: IconName}) {
  return (
    <svg
      className="game-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  )
}
