import { getDb } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId, taskName, schedule } = await request.json()

    const db = getDb()
    const nextRun = calculateNextRun(schedule)

    db.prepare("INSERT INTO scheduled_tasks (user_id, task_name, schedule, next_run) VALUES (?, ?, ?, ?)").run(
      userId,
      taskName,
      schedule,
      nextRun,
    )

    return Response.json({ success: true, nextRun })
  } catch (error) {
    return Response.json({ error: "Scheduling failed" }, { status: 500 })
  }
}

function calculateNextRun(schedule: string): Date {
  const now = new Date()
  if (schedule === "daily") {
    return new Date(now.getTime() + 24 * 60 * 60 * 1000)
  } else if (schedule === "weekly") {
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  } else if (schedule === "monthly") {
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  }
  return now
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const db = getDb()
    const tasks = db.prepare("SELECT * FROM scheduled_tasks WHERE user_id = ?").all(userId)

    return Response.json(tasks)
  } catch (error) {
    return Response.json({ error: "Failed to fetch scheduled tasks" }, { status: 500 })
  }
}
