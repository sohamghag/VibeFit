export async function getExerciseAI(exerciseName: string, description: string) {
  const apiKey = 'AIzaSyAFtFUomZNBF-3efP1tzSWO5VZ8Hp7nHXU'

  const prompt = `
You are a fitness expert.
Give me a clear, step-by-step guide on how to properly perform the exercise: "${exerciseName}".
Use the following info to improve your response:

Description: ${description}

Output format:
- Short introduction (1 lines)
- Step-by-step instructions (numbered {around 4 to 5 steps})
- Breathing tips
- Common mistakes to avoid
  `

  try {
    console.log('About to run ai')

    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' +
        apiKey,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{parts: [{text: prompt}]}],
        }),
      },
    )
    console.log('====================================')
    console.log('Ai Runnning is Completed')
    console.log('====================================')
    const data = await res.json()
    console.log('====================================')
    console.log('See the Data', data?.candidates?.[0]?.content?.parts?.[0]?.text)
    console.log('====================================')
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
  } catch (err) {
    console.log('AI ERROR:', err)
    return 'AI failed. Try again later.'
  }
}
