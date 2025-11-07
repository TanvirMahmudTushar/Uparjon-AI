import { getDb } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, reportType, dateFrom, dateTo, status, format = "json" } = body

    const db = getDb()

    // Build query based on filters
    let query = "SELECT * FROM tasks WHERE user_id = ?"
    const params: any[] = [userId]

    if (dateFrom) {
      query += " AND created_at >= ?"
      params.push(dateFrom)
    }

    if (dateTo) {
      query += " AND created_at <= ?"
      params.push(dateTo)
    }

    if (status) {
      query += " AND status = ?"
      params.push(status)
    }

    query += " ORDER BY created_at DESC"

    const tasks = db.prepare(query).all(...params)

    // Get payment data
    const paymentQuery = `SELECT * FROM payments WHERE user_id = ?`
    const paymentParams: any[] = [userId]
    
    if (dateFrom) {
      paymentParams.push(dateFrom)
    }
    if (dateTo) {
      paymentParams.push(dateTo)
    }

    const payments = db
      .prepare(
        `SELECT * FROM payments 
         WHERE user_id = ? 
         ${dateFrom ? "AND created_at >= ?" : ""} 
         ${dateTo ? "AND created_at <= ?" : ""}
         ORDER BY created_at DESC`
      )
      .all(...paymentParams)

    // Generate report data
    const reportData = {
      type: reportType,
      period: { from: dateFrom, to: dateTo },
      summary: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t: any) => t.status === "completed").length,
        pendingTasks: tasks.filter((t: any) => t.status === "pending").length,
        totalPayments: payments.length,
        totalRevenue: payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
      },
      tasks,
      payments,
      generatedAt: new Date().toISOString(),
    }

    // Save report to database
    const result = db
      .prepare(
        "INSERT INTO reports (user_id, report_type, data, format) VALUES (?, ?, ?, ?)"
      )
      .run(userId, reportType, JSON.stringify(reportData), format)

    return NextResponse.json({
      success: true,
      reportId: result.lastInsertRowid,
      data: reportData,
    })
  } catch (error: any) {
    console.error("Report generation error:", error)
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

    const reports = db
      .prepare(
        "SELECT id, user_id, report_type, created_at FROM reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
      )
      .all(userId)

    return NextResponse.json({
      success: true,
      reports,
    })
  } catch (error: any) {
    console.error("Fetch reports error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
