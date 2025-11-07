import { getDb } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId, achievementType, badgeName, points } = await request.json()

    const db = getDb()
    db.prepare("INSERT INTO user_achievements (user_id, achievement_type, badge_name, points) VALUES (?, ?, ?, ?)").run(
      userId,
      achievementType,
      badgeName,
      points,
    )

    // Update leaderboard
    const current = db.prepare("SELECT total_points FROM leaderboard WHERE user_id = ?").get(userId)
    const newPoints = (current?.total_points || 0) + points

    if (current) {
      db.prepare("UPDATE leaderboard SET total_points = ? WHERE user_id = ?").run(newPoints, userId)
    } else {
      db.prepare("INSERT INTO leaderboard (user_id, total_points, rank) VALUES (?, ?, ?)").run(userId, newPoints, 1)
    }

    return Response.json({ success: true, newPoints })
  } catch (error) {
    return Response.json({ error: "Failed to award achievement" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const db = getDb()
    const achievements = db
      .prepare("SELECT * FROM user_achievements WHERE user_id = ? ORDER BY created_at DESC")
      .all(userId)

    return Response.json(achievements)
  } catch (error) {
    return Response.json({ error: "Failed to fetch achievements" }, { status: 500 })
  }
}
