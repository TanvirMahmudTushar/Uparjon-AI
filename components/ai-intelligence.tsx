"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, Brain, Sparkles, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function AIIntelligence({ userId = "1" }: { userId?: string }) {
  const [predictions, setPredictions] = useState<any>(null)
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [sentiment, setSentiment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [predRes, anomRes, sentRes] = await Promise.all([
        fetch(`/api/ai-intelligence/predictions?userId=${userId}`),
        fetch(`/api/ai-intelligence/anomalies?userId=${userId}`),
        fetch(`/api/ai-intelligence/sentiment?userId=${userId}`),
      ])

      const predData = await predRes.json()
      const anomData = await anomRes.json()
      const sentData = await sentRes.json()

      if (predData.success) setPredictions(predData.predictions)
      if (anomData.success) setAnomalies(anomData.anomalies)
      if (sentData.success) setSentiment(sentData.sentiment)
    } catch (error) {
      console.error("Failed to fetch AI intelligence data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Brain className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading AI insights...</p>
        </div>
      </div>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Brain className="w-8 h-8" />
            AI Intelligence Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Predictive analytics, anomaly detection, and sentiment analysis
          </p>
        </div>
        <Button onClick={fetchData} className="bg-primary hover:bg-primary/90">
          <Sparkles className="w-4 h-4 mr-2" />
          Refresh Insights
        </Button>
      </div>

      {/* Predictive Analytics */}
      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Predictive Analytics
          </CardTitle>
          <CardDescription>AI-powered task completion forecasts for the next 7 days</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={predictions?.forecast || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                labelStyle={{ color: "#00f6ff" }}
              />
              <Bar dataKey="predicted_tasks" fill="#00f6ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predictions?.insights?.map((insight: string, idx: number) => (
              <div key={idx} className="bg-background p-4 rounded-lg border border-primary/20">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <p className="text-sm text-foreground">{insight}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Detection */}
      <Card className="bg-card border-accent/20">
        <CardHeader>
          <CardTitle className="text-accent flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Anomaly Detection
          </CardTitle>
          <CardDescription>Unusual patterns detected in work behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Total Anomalies</p>
              <p className="text-3xl font-bold text-foreground">{anomalies.length}</p>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">High Severity</p>
              <p className="text-3xl font-bold text-destructive">
                {anomalies.filter((a) => a.severity === "high").length}
              </p>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Medium Severity</p>
              <p className="text-3xl font-bold text-yellow-500">
                {anomalies.filter((a) => a.severity === "medium").length}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {anomalies.slice(0, 5).map((anomaly: any, idx: number) => (
              <div key={idx} className="bg-background p-4 rounded-lg border border-border flex items-start gap-3">
                <AlertTriangle
                  className={`w-5 h-5 mt-0.5 shrink-0 ${
                    anomaly.severity === "high"
                      ? "text-destructive"
                      : anomaly.severity === "medium"
                        ? "text-yellow-500"
                        : "text-muted-foreground"
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-foreground capitalize">
                      {anomaly.anomaly_type?.replace(/_/g, " ")}
                    </p>
                    <Badge variant={getSeverityColor(anomaly.severity)}>{anomaly.severity}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Detected: {new Date(anomaly.detected_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Analysis */}
      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Sentiment Analysis
          </CardTitle>
          <CardDescription>Communication sentiment trends from chat conversations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-background p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Overall Sentiment</p>
              <p className="text-2xl font-bold text-foreground capitalize">{sentiment?.overall || "Neutral"}</p>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${(sentiment?.score || 0.5) * 100}%` }}
                />
              </div>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Positive</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-green-500">{sentiment?.breakdown?.positive || 0}%</p>
                <TrendingUp className="w-5 h-5 text-green-500 mb-1" />
              </div>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Neutral</p>
              <p className="text-3xl font-bold text-muted-foreground">{sentiment?.breakdown?.neutral || 0}%</p>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Negative</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-destructive">{sentiment?.breakdown?.negative || 0}%</p>
                <TrendingDown className="w-5 h-5 text-destructive mb-1" />
              </div>
            </div>
          </div>

          <div className="bg-background p-4 rounded-lg space-y-2">
            <p className="text-sm font-semibold text-foreground mb-3">Key Trends</p>
            {sentiment?.trends?.map((trend: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <p className="text-sm text-muted-foreground">{trend}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
