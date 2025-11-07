import { getDb } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId, serviceName, apiKey, config } = await request.json()

    const db = getDb()
    db.prepare("INSERT INTO integrations (user_id, service_name, api_key, config) VALUES (?, ?, ?, ?)").run(
      userId,
      serviceName,
      apiKey,
      JSON.stringify(config),
    )

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Integration setup failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const db = getDb()
    const integrations = db.prepare("SELECT * FROM integrations WHERE user_id = ?").all(userId)

    return Response.json(integrations)
  } catch (error) {
    return Response.json({ error: "Failed to fetch integrations" }, { status: 500 })
  }
}
