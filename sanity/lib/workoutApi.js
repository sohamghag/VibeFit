import {nanoid} from 'nanoid/non-secure'
import {client} from '../sanityClient'

export const saveWorkout = async (userId, exercises) => {
  return await client.create({
    _type: 'workout',
    userId,
    date: new Date().toISOString(),

    exercises: exercises.map((item) => ({
      _type: 'exerciseLog',
      _key: nanoid(), // 👈 REQUIRED
      exercise: {
        _type: 'reference',
        _ref: item.exerciseId,
      },
      duration: item.duration,
      sets: item.sets.map((s) => ({
        _type: 'set',
        _key: nanoid(), // 👈 REQUIRED
        reps: s.reps,
        weightType: s.weightType,
        weightValue: s.weightValue,
      })),
    })),
  })
}
