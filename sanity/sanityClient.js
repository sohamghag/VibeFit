import {createClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: '4t5y49ym',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.EXPO_PUBLIC_SANITY_TOKEN,
  useCdn: false,
})

// Image URL builder
const builder = imageUrlBuilder(client)
export const urlFor = (source) => builder.image(source)
