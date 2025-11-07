import { getDb } from "@/lib/db"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    const secret = crypto.randomBytes(32).toString("hex")
    const backupCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString("hex"))

    const db = getDb()
    db.prepare("INSERT OR REPLACE INTO two_factor_auth (user_id, secret, backup_codes) VALUES (?, ?, ?)").run(
      userId,
      secret,
      JSON.stringify(backupCodes),
    )

    return Response.json({ success: true, secret, backupCodes })
  } catch (error) {
    return Response.json({ error: "2FA setup failed" }, { status: 500 })
  }
}
