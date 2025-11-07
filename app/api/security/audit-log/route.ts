import { getDb } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId, action, resource, details, ipAddress } = await request.json()

    const db = getDb()
    db.prepare("INSERT INTO audit_logs (user_id, action, resource, details, ip_address) VALUES (?, ?, ?, ?, ?)").run(
      userId,
      action,
      resource,
      details,
      ipAddress,
    )

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Audit log failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const db = getDb()
    const logs = db.prepare("SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100").all(userId)

    return Response.json(logs)
  } catch (error) {
    return Response.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}
