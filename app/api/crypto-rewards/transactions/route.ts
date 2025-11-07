import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "1"
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50")

    const db = getDb()

    const transactions = db
      .prepare(
        `SELECT * FROM crypto_transactions 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`
      )
      .all(userId, limit)

    return NextResponse.json({
      success: true,
      transactions,
    })
  } catch (error: any) {
    console.error("Transactions error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, transactionType, amount, tokenType = "WPAY" } = body

    const db = getDb()

    const txHash = "0x" + Math.random().toString(16).substr(2, 64)

    db.prepare(
      "INSERT INTO crypto_transactions (user_id, transaction_type, amount, token_type, transaction_hash, status, gas_fee) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(userId, transactionType, amount, tokenType, txHash, "completed", 0.001)

    return NextResponse.json({
      success: true,
      transactionHash: txHash,
    })
  } catch (error: any) {
    console.error("Transaction creation error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
