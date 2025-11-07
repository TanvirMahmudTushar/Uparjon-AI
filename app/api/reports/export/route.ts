import { getDb } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportId, format = "csv" } = body

    const db = getDb()

    // Get report data
    const report = db
      .prepare("SELECT * FROM reports WHERE id = ?")
      .get(reportId) as any

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      )
    }

    const reportData = JSON.parse(report.data)

    let exportContent = ""
    let fileName = `report_${reportId}_${Date.now()}`

    if (format === "csv") {
      // Convert to CSV
      fileName += ".csv"
      const tasks = reportData.tasks || []

      const headers = ["ID", "Title", "Status", "Created At"]
      const rows = tasks.map((task: any) => [
        task.id,
        task.title?.replace(/,/g, ";") || "",
        task.status,
        task.created_at,
      ])

      exportContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    } else if (format === "json") {
      fileName += ".json"
      exportContent = JSON.stringify(reportData, null, 2)
    }

    // Log export
    db.prepare(
      "INSERT INTO export_logs (user_id, report_id, file_name, format) VALUES (?, ?, ?, ?)"
    ).run(report.user_id, reportId, fileName, format)

    return NextResponse.json({
      success: true,
      fileName,
      content: exportContent,
      downloadUrl: `data:text/${format === "csv" ? "csv" : "json"};charset=utf-8,${encodeURIComponent(exportContent)}`,
    })
  } catch (error: any) {
    console.error("Export error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "1"
    const format = request.nextUrl.searchParams.get("format") || "csv"

    const db = getDb()
    const tasks = db.prepare("SELECT * FROM tasks WHERE user_id = ?").all(userId)

    if (format === "csv") {
      const csv = [
        ["ID", "Title", "Status", "Created At"],
        ...tasks.map((t: any) => [t.id, t.title, t.status, t.created_at]),
      ]
        .map((row) => row.join(","))
        .join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=tasks.csv",
        },
      })
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
