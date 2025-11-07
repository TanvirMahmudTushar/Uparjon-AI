import { getDb } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 })
    }

    const db = getDb()
    
    // Get all unique chat sessions for the user
    const sessions = db
      .prepare(`
        SELECT 
          chat_session_id as id,
          MIN(created_at) as createdAt,
          COUNT(*) as messageCount,
          (SELECT message FROM chat_messages cm2 
           WHERE cm2.chat_session_id = cm.chat_session_id 
           AND cm2.sender = 'user' 
           LIMIT 1) as title,
          (SELECT message FROM chat_messages cm3 
           WHERE cm3.chat_session_id = cm.chat_session_id 
           ORDER BY created_at DESC 
           LIMIT 1) as lastMessage
        FROM chat_messages cm
        WHERE user_id = ? AND chat_session_id IS NOT NULL
        GROUP BY chat_session_id
        ORDER BY createdAt DESC
        LIMIT 20
      `)
      .all(userId)
      .map((session: any) => ({
        id: session.id,
        title: session.title ? (session.title.length > 50 ? session.title.substring(0, 50) + "..." : session.title) : "New Chat",
        createdAt: session.createdAt,
        lastMessage: session.lastMessage ? (session.lastMessage.length > 60 ? session.lastMessage.substring(0, 60) + "..." : session.lastMessage) : "",
        messageCount: session.messageCount,
      }))

    return Response.json(sessions)
  } catch (error) {
    console.error("Chat sessions error:", error)
    return Response.json({ error: "Failed to fetch chat sessions" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return Response.json({ error: "Missing sessionId" }, { status: 400 })
    }

    const db = getDb()
    db.prepare("DELETE FROM chat_messages WHERE chat_session_id = ?").run(sessionId)

    return Response.json({ success: true })
  } catch (error) {
    console.error("Delete chat session error:", error)
    return Response.json({ error: "Failed to delete chat session" }, { status: 500 })
  }
}
