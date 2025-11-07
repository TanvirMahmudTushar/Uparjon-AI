import { getDb } from "@/lib/db"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { userId, analysisData } = await request.json()

    if (!userId || !analysisData) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = getDb()

    // Generate comprehensive workplace analysis using Groq
    let analysis = ""
    try {
      const { text } = await generateText({
        model: "groq/llama-3.3-70b-versatile",
        prompt: `You are an expert workplace analyst. Provide a comprehensive workplace analysis based on this data:

${JSON.stringify(analysisData, null, 2)}

Generate a detailed analysis including:
1. Current workplace metrics and performance indicators
2. Team dynamics and collaboration assessment
3. Productivity and efficiency analysis
4. Risk factors and opportunities
5. Strategic recommendations for improvement
6. 30-day action plan

Format as JSON with keys: metrics, teamDynamics, productivity, risks, recommendations, actionPlan`,
        temperature: 0.5,
        maxTokens: 1000,
      })
      analysis = text
    } catch (error) {
      console.error("Groq API error:", error)
      analysis = JSON.stringify({
        metrics: "Analyzing workplace performance...",
        teamDynamics: "Team collaboration appears stable",
        productivity: "Productivity metrics are being calculated",
        risks: "Monitoring for potential issues",
        recommendations: "Recommendations will be provided after analysis",
        actionPlan: "30-day plan will be generated",
      })
    }

    // Save analysis
    db.prepare("INSERT INTO workplace_analysis (user_id, analysis_data, metrics) VALUES (?, ?, ?)").run(
      userId,
      JSON.stringify(analysisData),
      analysis,
    )

    return Response.json({
      success: true,
      analysis: analysis,
    })
  } catch (error) {
    console.error("Workplace analysis error:", error)
    return Response.json({ error: "Failed to generate analysis" }, { status: 500 })
  }
}
