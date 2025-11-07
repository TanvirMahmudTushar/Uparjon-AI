import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "1"
    const db = getDb()

    const wallet = db
      .prepare("SELECT * FROM crypto_wallets WHERE user_id = ?")
      .get(userId) as any

    // Get token balance
    const transactions = db
      .prepare(
        `SELECT SUM(CASE WHEN transaction_type = 'earn' THEN amount ELSE -amount END) as balance
         FROM crypto_transactions 
         WHERE user_id = ? AND status = 'completed'`
      )
      .get(userId) as any

    const balance = transactions?.balance || 0
    const usdRate = 0.05 // $0.05 per WPAY token

    return NextResponse.json({
      success: true,
      wallet: wallet || { wallet_address: null, wallet_type: null },
      balance,
      balanceUSD: balance * usdRate,
      usdRate,
    })
  } catch (error: any) {
    console.error("Wallet balance error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, walletAddress, walletType } = body

    const db = getDb()

    // Check if wallet exists
    const existing = db
      .prepare("SELECT * FROM crypto_wallets WHERE user_id = ?")
      .get(userId)

    if (existing) {
      db.prepare(
        "UPDATE crypto_wallets SET wallet_address = ?, wallet_type = ? WHERE user_id = ?"
      ).run(walletAddress, walletType, userId)
    } else {
      db.prepare(
        "INSERT INTO crypto_wallets (user_id, wallet_address, wallet_type) VALUES (?, ?, ?)"
      ).run(userId, walletAddress, walletType)
    }

    return NextResponse.json({
      success: true,
      message: "Wallet connected",
    })
  } catch (error: any) {
    console.error("Wallet connection error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
