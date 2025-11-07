import { getDb } from "@/lib/db"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { userId, predictionType, historicalData } = await request.json()

    const prompt = `Analyze this work data and provide predictions:
Type: ${predictionType}
Data: ${JSON.stringify(historicalData)}

Provide predictions for: task completion time, productivity trends, and risk factors.
Return as JSON with fields: prediction, confidence (0-1), reasoning, recommendations.`

    const { text } = await generateText({
      model: "groq/llama-3.3-70b-versatile",
      prompt,
      temperature: 0.3,
    })

    const db = getDb()
    const result = db
      .prepare("INSERT INTO predictions (user_id, prediction_type, data, confidence) VALUES (?, ?, ?, ?)")
      .run(userId, predictionType, text, 0.85)

    return Response.json({ success: true, predictionId: result.lastInsertRowid, data: text })
  } catch (error) {
    return Response.json({ error: "Prediction failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const db = getDb()
    const predictions = db
      .prepare("SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10")
      .all(userId)

    return Response.json(predictions)
  } catch (error) {
    return Response.json({ error: "Failed to fetch predictions" }, { status: 500 })
  }
}
