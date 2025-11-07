import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "1"
    const db = getDb()

    const rules = db
      .prepare(`SELECT * FROM automation_rules WHERE user_id = ? ORDER BY created_at DESC`)
      .all(userId)

    return NextResponse.json({
      success: true,
      rules,
    })
  } catch (error: any) {
    console.error("Automation rules error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ruleName, triggerType, actionType, config, enabled = true } = body

    const db = getDb()

    db.prepare(
      "INSERT INTO automation_rules (user_id, rule_name, trigger_type, action_type, config, enabled) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(userId, ruleName, triggerType, actionType, config || "{}", enabled ? 1 : 0)

    return NextResponse.json({
      success: true,
      message: "Automation rule created",
    })
  } catch (error: any) {
    console.error("Automation rule creation error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
