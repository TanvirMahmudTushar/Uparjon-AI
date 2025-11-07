"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/lib/custom-icons"

interface DashboardProps {
  userId: number
}

export function Dashboard({ userId }: DashboardProps) {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const [userRes, creditRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/credit-score/${userId}`),
      ])

      const userData = await userRes.json()
      const creditData = await creditRes.json()

      setUser(userData)
      setStats(creditData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-foreground/60">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-4xl font-bold text-foreground mb-2">Welcome, {user?.name}</h1>
        <p className="text-foreground/60">Manage your freelance work and payments</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Credit Score",
            value: user?.credit_score?.toFixed(0),
            icon: Icons.TrendingUp,
            color: "text-primary",
          },
          { label: "Total Tasks", value: stats?.stats?.total_tasks || 0, icon: Icons.Zap, color: "text-accent" },
          {
            label: "Verified Tasks",
            value: stats?.stats?.verified_tasks || 0,
            icon: Icons.Shield,
            color: "text-success",
          },
          { label: "Paid Tasks", value: stats?.stats?.paid_tasks || 0, icon: Icons.CreditCard, color: "text-primary" },
        ].map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card
              key={idx}
              className="bg-card border-border p-6 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/60 text-sm">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}/50`} />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border p-6 animate-in fade-in slide-in-from-left-4 duration-500">
          <h2 className="text-xl font-bold text-foreground mb-4">Getting Started</h2>
          <ul className="space-y-3 text-foreground/80 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">1.</span>
              <span>Submit your completed tasks in the Tasks section</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">2.</span>
              <span>Our AI will verify your work instantly</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">3.</span>
              <span>Receive instant payments to your wallet</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">4.</span>
              <span>Build your credit profile over time</span>
            </li>
          </ul>
        </Card>

        <Card className="bg-card border-border p-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <h2 className="text-xl font-bold text-foreground mb-4">Security Features</h2>
          <ul className="space-y-3 text-foreground/80 text-sm">
            <li className="flex items-start gap-3">
              <Icons.Shield className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>AI-powered fraud detection</span>
            </li>
            <li className="flex items-start gap-3">
              <Icons.Shield className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>Real-time transaction monitoring</span>
            </li>
            <li className="flex items-start gap-3">
              <Icons.Shield className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>Secure wallet integration</span>
            </li>
            <li className="flex items-start gap-3">
              <Icons.Shield className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>Encrypted data transmission</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* CTA */}
      <Alert className="bg-primary/10 border-primary/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Icons.Zap className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          Ready to get started? Submit your first task to begin earning and building your credit profile.
        </AlertDescription>
      </Alert>
    </div>
  )
}
