import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50")
    const db = getDb()

    // Update leaderboard stats for all users
    const users = db.prepare("SELECT id FROM users").all()

    for (const user of users as any[]) {
      // Calculate total points from badges
      const badgePoints = db
        .prepare(
          `SELECT SUM(a.points) as total 
           FROM user_badges ub 
           JOIN achievements a ON ub.achievement_id = a.id 
           WHERE ub.user_id = ?`
        )
        .get(user.id) as any

      // Calculate tasks completed
      const taskStats = db
        .prepare(
          `SELECT COUNT(*) as total 
           FROM tasks 
           WHERE user_id = ? AND status = 'completed'`
        )
        .get(user.id) as any

      // Calculate streak (simplified - consecutive days)
      const streak = 7 // Placeholder

      const totalPoints = (badgePoints?.total || 0) + (taskStats?.total || 0) * 10

      // Upsert leaderboard stats
      const existing = db
        .prepare("SELECT * FROM leaderboard_stats WHERE user_id = ?")
        .get(user.id)

      if (existing) {
        db.prepare(
          `UPDATE leaderboard_stats 
           SET total_points = ?, tasks_completed = ?, streak_days = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE user_id = ?`
        ).run(totalPoints, taskStats?.total || 0, streak, user.id)
      } else {
        db.prepare(
          `INSERT INTO leaderboard_stats (user_id, total_points, tasks_completed, streak_days) 
           VALUES (?, ?, ?, ?)`
        ).run(user.id, totalPoints, taskStats?.total || 0, streak)
      }
    }

    // Get ranked leaderboard
    const leaderboard = db
      .prepare(
        `SELECT 
          ls.*,
          u.name,
          u.email,
          ROW_NUMBER() OVER (ORDER BY ls.total_points DESC) as rank
         FROM leaderboard_stats ls
         JOIN users u ON ls.user_id = u.id
         ORDER BY ls.total_points DESC
         LIMIT ?`
      )
      .all(limit)

    return NextResponse.json({
      success: true,
      leaderboard,
    })
  } catch (error: any) {
    console.error("Leaderboard error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
