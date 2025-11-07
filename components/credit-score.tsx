"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Award, Target } from "lucide-react"

interface CreditScoreProps {
  userId: number
}

export function CreditScore({ userId }: CreditScoreProps) {
  const [creditData, setCreditData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCreditData()
  }, [userId])

  const fetchCreditData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/credit-score/${userId}`)
      const data = await response.json()
      setCreditData(data)
    } catch (error) {
      console.error("Failed to fetch credit data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-foreground/60">Loading credit score...</div>
      </div>
    )
  }

  // Mock chart data
  const chartData = [
    { month: "Jan", score: 500 },
    { month: "Feb", score: 520 },
    { month: "Mar", score: 545 },
    { month: "Apr", score: 580 },
    { month: "May", score: 610 },
    { month: "Jun", score: creditData?.credit_score || 650 },
  ]

  const getScoreLevel = (score: number) => {
    if (score >= 750) return { level: "Excellent", color: "text-success" }
    if (score >= 650) return { level: "Good", color: "text-primary" }
    if (score >= 550) return { level: "Fair", color: "text-warning" }
    return { level: "Poor", color: "text-danger" }
  }

  const scoreLevel = getScoreLevel(creditData?.credit_score || 0)

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Credit Score</h1>
        <p className="text-foreground/60">Build your CredScore BD profile</p>
      </div>

      {/* Main Score Card */}
      <Card className="bg-card border-border p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground/60 text-lg mb-2">Your Credit Score</p>
            <p className={`text-6xl font-bold ${scoreLevel.color}`}>{creditData?.credit_score?.toFixed(0)}</p>
            <p className={`text-lg font-medium mt-2 ${scoreLevel.color}`}>{scoreLevel.level}</p>
          </div>
          <Award className={`w-24 h-24 ${scoreLevel.color}/30`} />
        </div>
      </Card>

      {/* Score Trend */}
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Score Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px" }}
              labelStyle={{ color: "#f5f5f5" }}
            />
            <Line type="monotone" dataKey="score" stroke="#00f6ff" strokeWidth={2} dot={{ fill: "#00f6ff" }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground/60 text-sm">Total Tasks</p>
              <p className="text-3xl font-bold text-primary mt-2">{creditData?.stats?.total_tasks || 0}</p>
            </div>
            <Target className="w-8 h-8 text-primary/50" />
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground/60 text-sm">Verified Tasks</p>
              <p className="text-3xl font-bold text-success mt-2">{creditData?.stats?.verified_tasks || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-success/50" />
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground/60 text-sm">Avg Score</p>
              <p className="text-3xl font-bold text-accent mt-2">
                {creditData?.stats?.avg_score ? (creditData.stats.avg_score * 100).toFixed(0) : 0}%
              </p>
            </div>
            <Award className="w-8 h-8 text-accent/50" />
          </div>
        </Card>
      </div>

      {/* Score Factors */}
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">What Affects Your Score</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Task Completion Rate</p>
              <p className="text-sm text-foreground/60">Successfully completing tasks increases your score</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Verification Score</p>
              <p className="text-sm text-foreground/60">Higher AI verification scores boost your profile</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Payment History</p>
              <p className="text-sm text-foreground/60">Timely payments and no fraud flags help</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Account Age</p>
              <p className="text-sm text-foreground/60">Longer account history builds trust</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
