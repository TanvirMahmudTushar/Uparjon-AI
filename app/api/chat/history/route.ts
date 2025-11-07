import { getDb } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const sessionId = searchParams.get("sessionId")

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 })
    }

    const db = getDb()
    
    let messages
    if (sessionId) {
      // Get messages for a specific session
      messages = db
        .prepare("SELECT * FROM chat_messages WHERE user_id = ? AND chat_session_id = ? ORDER BY created_at ASC")
        .all(userId, sessionId)
    } else {
      // Get all messages for backward compatibility
      messages = db
        .prepare("SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 50")
        .all(userId)
    }

    return Response.json(messages)
  } catch (error) {
    console.error("Chat history error:", error)
    return Response.json({ error: "Failed to fetch chat history" }, { status: 500 })
  }
}
