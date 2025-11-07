import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "1"
    const db = getDb()

    const integrations = db
      .prepare(
        `SELECT * FROM integrations WHERE user_id = ? ORDER BY created_at DESC`
      )
      .all(userId)

    return NextResponse.json({
      success: true,
      integrations,
    })
  } catch (error: any) {
    console.error("Integrations error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, serviceName, apiKey, config, enabled = true } = body

    const db = getDb()

    // Check if integration exists
    const existing = db
      .prepare(
        "SELECT * FROM integrations WHERE user_id = ? AND service_name = ?"
      )
      .get(userId, serviceName)

    if (existing) {
      db.prepare(
        "UPDATE integrations SET api_key = ?, config = ?, enabled = ? WHERE user_id = ? AND service_name = ?"
      ).run(apiKey, config || "{}", enabled ? 1 : 0, userId, serviceName)
    } else {
      db.prepare(
        "INSERT INTO integrations (user_id, service_name, api_key, config, enabled) VALUES (?, ?, ?, ?, ?)"
      ).run(userId, serviceName, apiKey, config || "{}", enabled ? 1 : 0)
    }

    return NextResponse.json({
      success: true,
      message: `${serviceName} integration configured`,
    })
  } catch (error: any) {
    console.error("Integration setup error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
