import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "1"
    const db = getDb()

    const webhooks = db
      .prepare(`SELECT * FROM webhooks WHERE user_id = ? ORDER BY created_at DESC`)
      .all(userId)

    return NextResponse.json({
      success: true,
      webhooks,
    })
  } catch (error: any) {
    console.error("Webhooks error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, eventType, url, active = true } = body

    const db = getDb()

    db.prepare(
      "INSERT INTO webhooks (user_id, event_type, url, active) VALUES (?, ?, ?, ?)"
    ).run(userId, eventType, url, active ? 1 : 0)

    return NextResponse.json({
      success: true,
      message: "Webhook created",
    })
  } catch (error: any) {
    console.error("Webhook creation error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
