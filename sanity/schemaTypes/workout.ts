import {defineType, defineField} from 'sanity'
import {Activity} from 'lucide-react'

export default defineType({
  name: 'workout',
  title: 'Workout',
  type: 'document',
  icon: Activity,

  fields: [
    // USER ID
    defineField({
      name: 'userId',
      title: 'User ID (Clerk)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    // DATE
    defineField({
      name: 'date',
      title: 'Workout Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),

    // EXERCISE LIST
    defineField({
      name: 'exercises',
      title: 'Exercises Performed',
      type: 'array',
      of: [
        defineField({
          name: 'exerciseLog',
          title: 'Exercise Log',
          type: 'object',

          fields: [
            // REFERENCE
            defineField({
              name: 'exercise',
              title: 'Exercise',
              type: 'reference',
              to: [{type: 'exercise'}],
              validation: (Rule) => Rule.required(),
            }),

            // ⏱️ DURATION PER EXERCISE
            defineField({
              name: 'duration',
              title: 'Duration (seconds)',
              type: 'number',
              validation: (Rule) => Rule.min(0),
            }),

            // SETS
            defineField({
              name: 'sets',
              title: 'Sets',
              type: 'array',
              of: [
                {
                  type: 'object',
                  title: 'Set',
                  fields: [
                    defineField({
                      name: 'reps',
                      title: 'Reps',
                      type: 'number',
                      validation: (Rule) => Rule.min(1),
                    }),

                    defineField({
                      name: 'weightType',
                      title: 'Weight Type',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'Kilograms (kg)', value: 'kg'},
                          {title: 'Pounds (lbs)', value: 'lbs'},
                        ],
                        layout: 'radio',
                      },
                    }),

                    defineField({
                      name: 'weightValue',
                      title: 'Weight',
                      type: 'number',
                      validation: (Rule) => Rule.min(0),
                    }),
                  ],

                  preview: {
                    select: {
                      reps: 'reps',
                      weightValue: 'weightValue',
                      weightType: 'weightType',
                    },
                    prepare({reps, weightValue, weightType}) {
                      return {
                        title: `${reps} reps`,
                        subtitle: `Weight: ${weightValue || 0} ${weightType || ''}`,
                      }
                    },
                  },
                },
              ],
            }),
          ],

          preview: {
            select: {
              title: 'exercise.name',
              sets: 'sets',
              duration: 'duration',
            },
            prepare({title, sets, duration}) {
              return {
                title: title || 'Exercise',
                subtitle: `${sets?.length || 0} sets • ${duration || 0}s`,
              }
            },
          },
        }),
      ],
    }),
  ],

  preview: {
    select: {
      date: 'date',
      userId: 'userId',
    },
    prepare({date, userId}) {
      return {
        title: `Workout: ${new Date(date).toDateString()}`,
        subtitle: `User: ${userId}`,
      }
    },
  },
})
