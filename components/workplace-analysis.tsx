"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Loader2, TrendingUp, Users, AlertCircle, CheckCircle } from "lucide-react"

interface WorkplaceAnalysisProps {
  userId: number
}

export function WorkplaceAnalysis({ userId }: WorkplaceAnalysisProps) {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [selectedMetric, setSelectedMetric] = useState("overview")

  const mockAnalysisData = {
    teamSize: 12,
    avgProductivity: 78,
    collaborationScore: 85,
    turnoverRate: 5,
    projectsCompleted: 24,
    avgTaskCompletion: 92,
    employeeSatisfaction: 8.2,
    trainingHours: 156,
  }

  const performanceData = [
    { month: "Jan", productivity: 72, collaboration: 78, satisfaction: 7.8 },
    { month: "Feb", productivity: 75, collaboration: 80, satisfaction: 7.9 },
    { month: "Mar", productivity: 78, collaboration: 82, satisfaction: 8.0 },
    { month: "Apr", productivity: 80, collaboration: 85, satisfaction: 8.2 },
    { month: "May", productivity: 82, collaboration: 87, satisfaction: 8.3 },
    { month: "Jun", productivity: 85, collaboration: 88, satisfaction: 8.4 },
  ]

  const departmentData = [
    { name: "Engineering", productivity: 88, satisfaction: 8.5 },
    { name: "Sales", productivity: 82, satisfaction: 8.1 },
    { name: "Marketing", productivity: 79, satisfaction: 7.9 },
    { name: "HR", productivity: 75, satisfaction: 8.0 },
    { name: "Operations", productivity: 81, satisfaction: 8.2 },
  ]

  const handleGenerateAnalysis = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/workplace-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          analysisData: mockAnalysisData,
        }),
      })

      const data = await response.json()
      if (data.analysis) {
        setAnalysis(data.analysis)
      }
    } catch (error) {
      console.error("Failed to generate analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Workplace Analytics</h2>
              <p className="text-sm text-foreground/60">AI-powered insights into your team performance</p>
            </div>
          </div>
          <Button
            onClick={handleGenerateAnalysis}
            disabled={loading}
            className="bg-primary text-background hover:bg-primary-dark"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Generate Analysis"
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60">Team Size</p>
                <p className="text-2xl font-bold text-primary">{mockAnalysisData.teamSize}</p>
              </div>
              <Users className="w-8 h-8 text-primary/30" />
            </div>
          </Card>

          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60">Avg Productivity</p>
                <p className="text-2xl font-bold text-primary">{mockAnalysisData.avgProductivity}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary/30" />
            </div>
          </Card>

          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60">Collaboration</p>
                <p className="text-2xl font-bold text-primary">{mockAnalysisData.collaborationScore}%</p>
              </div>
              <Users className="w-8 h-8 text-primary/30" />
            </div>
          </Card>

          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60">Satisfaction</p>
                <p className="text-2xl font-bold text-primary">{mockAnalysisData.employeeSatisfaction}/10</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary/30" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trend */}
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Performance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis stroke="var(--color-foreground)" />
                <YAxis stroke="var(--color-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="productivity" stroke="var(--color-primary)" strokeWidth={2} />
                <Line type="monotone" dataKey="collaboration" stroke="var(--color-accent)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Department Performance */}
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Department Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis stroke="var(--color-foreground)" />
                <YAxis stroke="var(--color-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                />
                <Legend />
                <Bar dataKey="productivity" fill="var(--color-primary)" />
                <Bar dataKey="satisfaction" fill="var(--color-accent)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* AI Analysis Results */}
        {analysis && (
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              AI Analysis Results
            </h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground/80 whitespace-pre-wrap">{analysis}</p>
            </div>
          </Card>
        )}

        {/* Recommendations */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Key Recommendations</h3>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-background rounded-lg border border-border/50">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Enhance Team Collaboration</p>
                <p className="text-sm text-foreground/60">Implement weekly sync meetings and collaborative tools</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-background rounded-lg border border-border/50">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Professional Development</p>
                <p className="text-sm text-foreground/60">
                  Allocate budget for training and skill development programs
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-background rounded-lg border border-border/50">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Performance Recognition</p>
                <p className="text-sm text-foreground/60">Establish clear metrics and reward high performers</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
