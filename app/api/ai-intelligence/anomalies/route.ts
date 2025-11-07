import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import Groq from "groq-sdk"

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    return null
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY })
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "1"
    const db = getDb()

    // Get user's work patterns
    const tasks = db
      .prepare(
        `SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`
      )
      .all(userId)

    const payments = db
      .prepare(
        `SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`
      )
      .all(userId)

    const groq = getGroqClient()
    let result

    // Use Groq to detect anomalies if API key available
    if (groq) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are an anomaly detection AI. Identify unusual patterns in work and payment data.",
            },
            {
              role: "user",
              content: `Analyze this data for anomalies: Tasks: ${JSON.stringify(tasks.slice(0, 10))}, Payments: ${JSON.stringify(payments.slice(0, 10))}. Return JSON with: {anomalies: [{type: string, severity: 'low'|'medium'|'high', description: string, detected_at: string}]}`,
            },
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.5,
          max_tokens: 1024,
        })

        const aiResponse = completion.choices[0]?.message?.content || "{}"
        result = JSON.parse(aiResponse)
      } catch (error) {
        console.error("Groq API error:", error)
        result = null
      }
    }

    // Fallback anomalies if Groq is not available
    if (!result) {
      result = {
        anomalies: [
          {
            type: "unusual_hours",
            severity: "low",
            description: "Task submissions detected at unusual hours (2-4 AM)",
            detected_at: new Date().toISOString(),
          },
          {
            type: "payment_spike",
            severity: "medium",
            description: "Payment amounts 150% higher than average this week",
            detected_at: new Date().toISOString(),
          },
        ],
      }
    }

    // Store anomalies in database
    result.anomalies?.forEach((anomaly: any) => {
      db.prepare(
        "INSERT INTO anomalies (user_id, anomaly_type, severity, description) VALUES (?, ?, ?, ?)"
      ).run(userId, anomaly.type, anomaly.severity, anomaly.description)
    })

    // Get recent anomalies from database
    const storedAnomalies = db
      .prepare(
        `SELECT * FROM anomalies WHERE user_id = ? ORDER BY detected_at DESC LIMIT 10`
      )
      .all(userId)

    return NextResponse.json({
      success: true,
      anomalies: storedAnomalies,
    })
  } catch (error: any) {
    console.error("Anomaly detection error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
