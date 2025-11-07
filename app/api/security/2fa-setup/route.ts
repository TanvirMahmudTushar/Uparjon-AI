import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import * as crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, enable } = body

    const db = getDb()

    if (enable) {
      // Generate secret and backup codes
      const secret = crypto.randomBytes(20).toString("hex")
      const backupCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString("hex").toUpperCase()
      )

      // Check if 2FA already exists
      const existing = db
        .prepare("SELECT * FROM two_factor_auth WHERE user_id = ?")
        .get(userId)

      if (existing) {
        db.prepare(
          "UPDATE two_factor_auth SET secret = ?, enabled = 1, backup_codes = ? WHERE user_id = ?"
        ).run(secret, JSON.stringify(backupCodes), userId)
      } else {
        db.prepare(
          "INSERT INTO two_factor_auth (user_id, secret, enabled, backup_codes) VALUES (?, ?, 1, ?)"
        ).run(userId, secret, JSON.stringify(backupCodes))
      }

      return NextResponse.json({
        success: true,
        secret,
        backupCodes,
        qrCodeUrl: `otpauth://totp/UparjonAI:user${userId}?secret=${secret}&issuer=UparjonAI`,
      })
    } else {
      // Disable 2FA
      db.prepare("UPDATE two_factor_auth SET enabled = 0 WHERE user_id = ?").run(
        userId
      )

      return NextResponse.json({
        success: true,
        message: "2FA disabled",
      })
    }
  } catch (error: any) {
    console.error("2FA setup error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "1"
    const db = getDb()

    const twoFa = db
      .prepare("SELECT enabled FROM two_factor_auth WHERE user_id = ?")
      .get(userId) as any

    return NextResponse.json({
      success: true,
      enabled: twoFa?.enabled === 1,
    })
  } catch (error: any) {
    console.error("2FA status error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
