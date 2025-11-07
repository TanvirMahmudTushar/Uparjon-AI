import { getDb } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "10"

    const db = getDb()
    const leaderboard = db
      .prepare(
        `SELECT l.*, u.name, u.email FROM leaderboard l 
       JOIN users u ON l.user_id = u.id 
       ORDER BY l.total_points DESC LIMIT ?`,
      )
      .all(Number.parseInt(limit))

    return Response.json(leaderboard)
  } catch (error) {
    return Response.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    const db = getDb()
    const userRank = db
      .prepare(
        `SELECT COUNT(*) as rank FROM leaderboard 
       WHERE total_points > (SELECT total_points FROM leaderboard WHERE user_id = ?)`,
      )
      .get(userId)

    return Response.json({ rank: (userRank?.rank || 0) + 1 })
  } catch (error) {
    return Response.json({ error: "Failed to calculate rank" }, { status: 500 })
  }
}
