import AsyncStorage from '@react-native-async-storage/async-storage'
import {client} from '../../sanity/sanityClient'
import {useUser} from '@clerk/clerk-expo'
const CACHE_KEY = 'EXERCISE_CACHE_V1'
const CACHE_DURATION = 15 * 24 * 60 * 60 * 1000 // 15 days in ms

export async function getAllExercises() {
  try {
    // 1) CHECK CACHE FIRST
    const cached = await AsyncStorage.getItem(CACHE_KEY)

    if (cached) {
      const parsed = JSON.parse(cached)
      const isExpired = Date.now() > parsed.expiry

      if (!isExpired) {
        console.log('📦 Returning cached exercises')
        return parsed.data
      } else {
        console.log('⚠️ Cache expired, fetching fresh data')
      }
    }

    // 2) FETCH FROM SANITY IF NO CACHE OR EXPIRED
    const query = `
      *[_type == "exercise" && isActive == true]{
        _id,
        name,
        description,
        difficulty,
        videoUrl,
        image {
          asset->{
            url
          }
        }
      } | order(name asc)
    `

    const result = await client.fetch(query)
    console.log('🟢 Fetched fresh data from Sanity')

    // 3) STORE IN CACHE
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data: result,
        expiry: Date.now() + CACHE_DURATION,
      }),
    )

    return result
  } catch (err) {
    console.error('❌ Error in getAllExercises:', err)
    return []
  }
}
