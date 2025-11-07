import { getDb } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId, role, permissions } = await request.json()

    const db = getDb()
    db.prepare("INSERT OR REPLACE INTO user_roles (user_id, role, permissions) VALUES (?, ?, ?)").run(
      userId,
      role,
      JSON.stringify(permissions),
    )

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "RBAC setup failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const db = getDb()
    const role = db.prepare("SELECT * FROM user_roles WHERE user_id = ?").get(userId)

    return Response.json(role || { role: "user", permissions: [] })
  } catch (error) {
    return Response.json({ error: "Failed to fetch role" }, { status: 500 })
  }
}
