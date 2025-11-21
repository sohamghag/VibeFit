import {defineType, defineField} from 'sanity'
import {Dumbbell} from 'lucide-react'
export default defineType({
  name: 'exercise',
  title: 'Exercise',
  type: 'document',
  icon: Dumbbell,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(2),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: {
        list: [
          {title: 'Beginner', value: 'beginner'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Advance', value: 'advance'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
    }),

    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
    }),

    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),

    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),

    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],

  // Auto-update `updatedAt`
  preview: {
    select: {
      title: 'name',
      media: 'image',
      difficulty: 'difficulty',
    },
    prepare({title, media, difficulty}) {
      return {
        title,
        media,
        subtitle: `Level: ${difficulty}`,
      }
    },
  },
})
