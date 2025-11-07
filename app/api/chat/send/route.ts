import { getDb } from "@/lib/db"
import { Groq } from "groq-sdk"
import os from "os"

// Initialize Groq client with graceful fallback
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY
  console.log("Groq API Key present:", apiKey ? "Yes" : "No")
  console.log("API Key starts with:", apiKey ? apiKey.substring(0, 10) + "..." : "N/A")
  if (apiKey) {
    try {
      return new Groq({ apiKey })
    } catch (error) {
      console.error("Failed to initialize Groq client:", error)
      return null
    }
  }
  return null
}

const groqClient = getGroqClient()
console.log("Groq client initialized:", groqClient ? "Yes" : "No")

export async function POST(request: Request) {
  try {
    // Check if request contains FormData (file upload)
    const contentType = request.headers.get("content-type") || ""
    let userId: number
    let message: string
    let analysisType: string
    let chatSessionId: string | null
    let fileCount = 0
    const attachments: Array<{ name: string; type: string; size: number }> = []

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData()
      userId = Number(formData.get("userId"))
      message = (formData.get("message") as string) || ""
      analysisType = (formData.get("analysisType") as string) || "general"
      chatSessionId = (formData.get("chatSessionId") as string) || null
      fileCount = Number(formData.get("fileCount") || 0)

      // Process uploaded files
      for (let i = 0; i < fileCount; i++) {
        const file = formData.get(`file${i}`) as File | null
        if (file) {
          attachments.push({
            name: file.name,
            type: file.type,
            size: file.size,
          })
          // In a production app, you would save files to storage here
          // For now, we'll just log and include metadata
          console.log(`File uploaded: ${file.name} (${file.type}, ${file.size} bytes)`)
        }
      }

      // Enhance message with file context
      if (attachments.length > 0 && !message) {
        message = `I've uploaded ${attachments.length} file(s): ${attachments.map(f => f.name).join(", ")}`
      } else if (attachments.length > 0) {
        message += ` [Attached ${attachments.length} file(s): ${attachments.map(f => f.name).join(", ")}]`
      }
    } else {
      // Handle regular JSON request
      const body = await request.json()
      userId = body.userId
      message = body.message
      analysisType = body.analysisType
      chatSessionId = body.chatSessionId
    }

    console.log("Chat API received:", { userId, message, analysisType, chatSessionId, attachments })

    if (!userId || !message) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = getDb()

    // Save user message
    db.prepare("INSERT INTO chat_messages (user_id, message, sender, analysis_type, chat_session_id) VALUES (?, ?, ?, ?, ?)").run(
      userId,
      message,
      "user",
      analysisType || null,
      chatSessionId || null,
    )

    // Generate AI response using Groq
    let aiResponse = ""
    
    if (groqClient) {
      console.log("Using Groq API for response...")
      try {
        const completion = await groqClient.chat.completions.create({
          model: "llama-3.3-70b-versatile", // Updated to newer model
          messages: [
            {
              role: "system",
              content: "You are an expert workplace analyst and career advisor. Provide concise, actionable insights with specific recommendations.",
            },
            {
              role: "user",
              content: `Analyze this workplace situation (${analysisType || "general"}): ${message}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        })
        aiResponse = completion.choices[0]?.message?.content || "I understand your concern. Let me help you analyze this situation."
        console.log("Groq response received:", aiResponse.substring(0, 100) + "...")
      } catch (error) {
        console.error("Groq API error:", error)
        aiResponse = generateFallbackResponse(message, analysisType)
      }
    } else {
      console.log("Using fallback response (no Groq API key)...")
      // Fallback response when Groq is not configured
      aiResponse = generateFallbackResponse(message, analysisType)
    }

    console.log("Saving AI response to database...")
    // Save AI response
    db.prepare("INSERT INTO chat_messages (user_id, message, sender, analysis_type, chat_session_id) VALUES (?, ?, ?, ?, ?)").run(
      userId,
      aiResponse,
      "assistant",
      analysisType || null,
      chatSessionId || null,
    )

    console.log("Returning response to client...")
    return Response.json({
      success: true,
      userMessage: message,
      aiResponse: aiResponse,
    })
  } catch (error) {
    console.error("Chat error:", error)
    return Response.json({ error: "Failed to process message", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

function generateFallbackResponse(message: string, analysisType: string): string {
  const responses = {
    general: `Thank you for sharing. Based on your message, here are some key insights:

📊 Analysis: This appears to be an important workplace consideration that requires careful thought.

💡 Recommendations:
1. Document all relevant details and communications
2. Consider discussing with your supervisor or HR if appropriate
3. Focus on solutions that align with organizational goals

🎯 Next Steps: Evaluate the situation objectively and take action based on your company's policies and best practices.`,

    productivity: `Productivity Analysis:

⚡ Key Insights: Your focus on productivity shows professional dedication.

📈 Recommendations:
1. Break down large tasks into smaller, manageable chunks
2. Use time-blocking techniques for deep work
3. Minimize distractions during focused work periods
4. Take regular breaks to maintain energy levels

🎯 Expected Outcomes: Implementing these strategies can improve efficiency by 20-30%.`,

    team: `Team Dynamics Analysis:

👥 Insights: Team collaboration is crucial for success.

🤝 Recommendations:
1. Foster open communication channels
2. Clarify roles and responsibilities
3. Celebrate team wins together
4. Address conflicts promptly and professionally

✨ Impact: Strong team dynamics lead to better outcomes and higher satisfaction.`,

    career: `Career Development Insights:

🚀 Analysis: Career growth requires strategic planning.

📚 Recommendations:
1. Identify skill gaps and create a learning plan
2. Seek mentorship from experienced professionals
3. Take on challenging projects to build experience
4. Network within and outside your organization

🎯 Long-term Benefits: Continuous development positions you for advancement opportunities.`,
  }

  return responses[analysisType as keyof typeof responses] || responses.general
}
