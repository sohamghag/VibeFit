import AsyncStorage from '@react-native-async-storage/async-storage'
import {client} from '../../sanity/sanityClient'

const HISTORY_CACHE_KEY = 'AIAPP_WORKOUT_HISTORY_CACHE_V1'
// const CACHE_EXPIRY = 1000 * 60 * 60 * 1 // 1 hour

export async function getWorkoutHistory(userId) {
  const cached = await AsyncStorage.getItem(HISTORY_CACHE_KEY)

  // if (cached) {
  //   const parsed = JSON.parse(cached)
  //   const isExpired = Date.now() > parsed.expiry

  //   if (!isExpired) {
  //     console.log('📦 Returning cached workout history')
  //     return parsed.data
  //   }
  // }

  const query = `
    *[_type == "workout" && userId == $userId] 
    | order(date desc) {
      _id,
      date,
      exercises[] {
        _key,
        duration,
        exercise->{
          _id,
          name,
          difficulty,
          image {
            asset->{
              url
            }
          }
        },
        sets[] {
          reps,
          weightValue,
          weightType
        }
      }
    }
  `

  try {
    const result = await client.fetch(query, {userId})
    console.log('🔥 Fresh workout history:', result)

    // await AsyncStorage.setItem(
    //   HISTORY_CACHE_KEY,
    //   JSON.stringify({
    //     data: result,
    //     expiry: Date.now() + CACHE_EXPIRY,
    //   }),
    // )

    return result
  } catch (err) {
    console.log('❌ Error fetching workout history:', err)
    return []
  }
}

export const getWorkoutCount = async (userId) => {
  const query = `count(*[_type == "workout" && userId == "${userId}"])`
  return await client.fetch(query)
}

export const getTotalMinutesTrained = async (userId) => {
  const query = `
    *[_type == "workout" && userId == "${userId}"]{
      exercises[]{
        duration
      }
    }
  `

  const allWorkouts = await client.fetch(query)

  let totalSeconds = 0

  allWorkouts.forEach((w) => {
    w.exercises?.forEach((ex) => {
      totalSeconds += ex.duration || 0
    })
  })

  console.log('====================================')
  console.log(totalSeconds)
  console.log('====================================')

  return Number((totalSeconds / 60).toFixed(2))
}
