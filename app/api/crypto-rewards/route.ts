import { getDb } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId, tokenType, amount, walletAddress } = await request.json()

    const db = getDb()
    const transactionHash = "0x" + Math.random().toString(16).substr(2, 64)

    db.prepare(
      "INSERT INTO crypto_rewards (user_id, token_type, amount, wallet_address, transaction_hash, status) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(userId, tokenType, amount, walletAddress, transactionHash, "completed")

    return Response.json({ success: true, transactionHash })
  } catch (error) {
    return Response.json({ error: "Crypto reward failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const db = getDb()
    const rewards = db.prepare("SELECT * FROM crypto_rewards WHERE user_id = ? ORDER BY created_at DESC").all(userId)

    return Response.json(rewards)
  } catch (error) {
    return Response.json({ error: "Failed to fetch rewards" }, { status: 500 })
  }
}
