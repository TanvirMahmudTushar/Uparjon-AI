import { getDb } from "@/lib/db"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { userId, workData } = await request.json()

    const prompt = `Analyze this work data for anomalies:
${JSON.stringify(workData)}

Identify unusual patterns, potential issues, and risks. Return JSON with: anomalies (array), severity (low/medium/high), recommendations.`

    const { text } = await generateText({
      model: "groq/llama-3.3-70b-versatile",
      prompt,
      temperature: 0.2,
    })

    const db = getDb()
    const anomalyData = JSON.parse(text)

    for (const anomaly of anomalyData.anomalies || []) {
      db.prepare("INSERT INTO anomalies (user_id, anomaly_type, severity, description) VALUES (?, ?, ?, ?)").run(
        userId,
        anomaly.type,
        anomalyData.severity,
        anomaly.description,
      )
    }

    return Response.json({ success: true, anomalies: anomalyData })
  } catch (error) {
    return Response.json({ error: "Anomaly detection failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const db = getDb()
    const anomalies = db
      .prepare("SELECT * FROM anomalies WHERE user_id = ? ORDER BY detected_at DESC LIMIT 20")
      .all(userId)

    return Response.json(anomalies)
  } catch (error) {
    return Response.json({ error: "Failed to fetch anomalies" }, { status: 500 })
  }
}
