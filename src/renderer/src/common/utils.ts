export function classObject(obj: { [key: string]: any }): string {
  return Object.keys(obj)
    .map((key) => (obj[key] ? key : ''))
    .filter((className) => className.length > 0)
    .join(' ')
}

export function humanFileSize(size: number, digits = 2) {
  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024))
  return Number((size / Math.pow(1024, i)).toFixed(digits)) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i]
}

export function isShortcut(e: KeyboardEvent, shortcut: string): boolean {
  const split = shortcut.split('+')
  // console.log(e.ctrlKey, e.key.charAt(0).toUpperCase() + e.key.slice(1))
  if (split.includes('CmdOrCtrl') && !e.ctrlKey && !e.metaKey) return false
  if (split.includes('Shift') && !e.shiftKey) return false
  if (split.includes('Alt') && !e.altKey) return false
  return e.key.charAt(0).toUpperCase() + e.key.slice(1) === split.pop()
}
