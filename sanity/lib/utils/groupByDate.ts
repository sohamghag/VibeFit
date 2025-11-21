import {Workout} from '../../sanity.types'

export function groupByDate(workouts: Workout[]): Record<string, Workout[]> {
  const groups: Record<string, Workout[]> = {}

  workouts.forEach((w) => {
    const date = new Date(w.date || '').toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(w)
  })

  return groups
}
