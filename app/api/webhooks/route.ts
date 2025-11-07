import { getDb } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId, eventType, url } = await request.json()

    const db = getDb()
    db.prepare("INSERT INTO webhooks (user_id, event_type, url) VALUES (?, ?, ?)").run(userId, eventType, url)

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Webhook setup failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const db = getDb()
    const webhooks = db.prepare("SELECT * FROM webhooks WHERE user_id = ?").all(userId)

    return Response.json(webhooks)
  } catch (error) {
    return Response.json({ error: "Failed to fetch webhooks" }, { status: 500 })
  }
}
