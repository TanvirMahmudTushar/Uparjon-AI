import { getDb } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 })
    }

    const db = getDb()
    const analyses = db
      .prepare("SELECT * FROM workplace_analysis WHERE user_id = ? ORDER BY created_at DESC LIMIT 10")
      .all(userId)

    return Response.json(analyses)
  } catch (error) {
    console.error("Analysis history error:", error)
    return Response.json({ error: "Failed to fetch analysis history" }, { status: 500 })
  }
}
