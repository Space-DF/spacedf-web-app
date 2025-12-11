import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

export function formatDuration(ms: number) {
  if (ms === 0) return '0 min'
  const dur = dayjs.duration(ms)
  const parts = []

  const hours = dur.hours()
  const minutes = dur.minutes()
  const seconds = dur.seconds()

  if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`)
  if (minutes > 0) parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`)
  if (hours === 0 && minutes === 0 && seconds > 0)
    parts.push(`${seconds} sec${seconds > 1 ? 's' : ''}`)

  return parts.join(' ')
}
