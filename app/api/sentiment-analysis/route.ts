import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { userId, messages } = await request.json()

    const prompt = `Analyze the sentiment and tone of these workplace messages:
${messages.join("\n")}

Provide: overall_sentiment (positive/neutral/negative), confidence (0-1), key_themes, team_morale_score (0-100), recommendations.`

    const { text } = await generateText({
      model: "groq/llama-3.3-70b-versatile",
      prompt,
      temperature: 0.3,
    })

    return Response.json({ success: true, analysis: text })
  } catch (error) {
    return Response.json({ error: "Sentiment analysis failed" }, { status: 500 })
  }
}
