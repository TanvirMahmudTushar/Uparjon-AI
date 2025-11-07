import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "1"
    const db = getDb()

    // Get user's achievements
    const userBadges = db
      .prepare(
        `SELECT ub.*, a.name, a.description, a.icon, a.points 
         FROM user_badges ub 
         JOIN achievements a ON ub.achievement_id = a.id 
         WHERE ub.user_id = ?
         ORDER BY ub.earned_at DESC`
      )
      .all(userId)

    // Get all available achievements
    const allAchievements = db
      .prepare("SELECT * FROM achievements ORDER BY points DESC")
      .all()

    // Get user's stats
    const stats = db
      .prepare(
        `SELECT 
          COUNT(*) as total_tasks,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
         FROM tasks 
         WHERE user_id = ?`
      )
      .get(userId) as any

    // Check and award new achievements
    const tasksCompleted = stats?.completed_tasks || 0

    // Task Master: 100 tasks
    if (tasksCompleted >= 100) {
      const taskMaster = allAchievements.find((a: any) => a.name === "Task Master") as any
      if (taskMaster) {
        const hasIt = userBadges.find((b: any) => b.name === "Task Master")
        if (!hasIt) {
          db.prepare("INSERT INTO user_badges (user_id, achievement_id) VALUES (?, ?)").run(
            userId,
            taskMaster.id
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      achievements: userBadges,
      available: allAchievements,
      stats: {
        tasksCompleted,
        totalAchievements: userBadges.length,
        totalPoints: userBadges.reduce((sum: number, b: any) => sum + (b.points || 0), 0),
      },
    })
  } catch (error: any) {
    console.error("Achievements error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
