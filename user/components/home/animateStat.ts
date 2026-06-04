import { animate } from 'animejs'

export type ParsedStat = {
  prefix: string
  number: number | null
  suffix: string
  display: string
}

export function parseStatValue(raw: string): ParsedStat {
  const trimmed = raw.trim() || '—'
  const match = trimmed.match(/^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/)
  if (!match) {
    return { prefix: '', number: null, suffix: '', display: trimmed }
  }
  return {
    prefix: match[1],
    number: parseFloat(match[2]),
    suffix: match[3],
    display: trimmed,
  }
}

export function runStatAnimation(
  parsed: ParsedStat,
  onValue: (text: string) => void,
  duration = 1600
) {
  if (parsed.number === null) {
    onValue(parsed.display)
    animate(
      { o: 0 },
      {
        o: 1,
        duration: 600,
        ease: 'outQuad',
        onUpdate: () => onValue(parsed.display),
      }
    )
    return
  }

  const state = { n: 0 }
  animate(state, {
    n: parsed.number,
    duration,
    ease: 'outExpo',
    onUpdate: () => {
      const rounded =
        Number.isInteger(parsed.number) || parsed.suffix.includes('%')
          ? Math.round(state.n)
          : Math.round(state.n * 10) / 10
      onValue(`${parsed.prefix}${rounded}${parsed.suffix}`)
    },
  })
}
