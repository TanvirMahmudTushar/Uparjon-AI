import { getDb } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      initialInvestment = 10000,
      monthlyRevenue = 5000,
      monthlyExpenses = 2000,
      growthRate = 5,
      months = 12,
    } = body

    const db = getDb()

    // Calculate ROI projections
    const projections = []
    let balance = initialInvestment
    let totalRevenue = 0
    let totalExpenses = 0

    for (let month = 1; month <= months; month++) {
      const revenue = monthlyRevenue * (1 + (growthRate / 100) * (month - 1))
      const expenses = monthlyExpenses * (1 + (growthRate / 100) * (month - 1) * 0.5)

      totalRevenue += revenue
      totalExpenses += expenses
      balance += revenue - expenses

      projections.push({
        month,
        revenue: Math.round(revenue),
        expenses: Math.round(expenses),
        profit: Math.round(revenue - expenses),
        balance: Math.round(balance),
      })
    }

    const roi = ((balance - initialInvestment) / initialInvestment) * 100
    const breakEvenMonth =
      projections.find((p) => p.balance >= initialInvestment)?.month || months

    const result = {
      initialInvestment,
      projections,
      summary: {
        totalRevenue: Math.round(totalRevenue),
        totalExpenses: Math.round(totalExpenses),
        totalProfit: Math.round(totalRevenue - totalExpenses),
        roi: Math.round(roi * 100) / 100,
        breakEvenMonth,
        finalBalance: Math.round(balance),
      },
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    console.error("ROI calculation error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
