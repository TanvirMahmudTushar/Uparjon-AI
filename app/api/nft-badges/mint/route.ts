import { getDb } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId, badgeId, metadata } = await request.json()

    const db = getDb()
    const tokenId = Math.random().toString(36).substr(2, 9)
    const contractAddress = "0x" + Math.random().toString(16).substr(2, 40)

    db.prepare(
      "INSERT INTO nft_badges (user_id, badge_id, metadata, contract_address, token_id, minted_at) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(userId, badgeId, JSON.stringify(metadata), contractAddress, tokenId, new Date().toISOString())

    return Response.json({ success: true, tokenId, contractAddress })
  } catch (error) {
    return Response.json({ error: "NFT minting failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const db = getDb()
    const badges = db.prepare("SELECT * FROM nft_badges WHERE user_id = ?").all(userId)

    return Response.json(badges)
  } catch (error) {
    return Response.json({ error: "Failed to fetch NFT badges" }, { status: 500 })
  }
}
