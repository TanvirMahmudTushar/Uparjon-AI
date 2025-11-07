"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { Download, FileText, Calculator, TrendingUp, DollarSign } from "lucide-react"

export function AdvancedAnalytics({ userId = "1" }: { userId?: string }) {
  const [roi, setRoi] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    status: "all",
    reportType: "performance",
  })
  const [roiParams, setRoiParams] = useState({
    initialInvestment: 10000,
    monthlyRevenue: 5000,
    monthlyExpenses: 2000,
    growthRate: 5,
    months: 12,
  })

  useEffect(() => {
    fetchReports()
    calculateROI()
  }, [userId])

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/reports/generate?userId=${userId}`)
      const data = await response.json()
      if (data.success) setReports(data.reports)
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    }
  }

  const generateReport = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...filters,
        }),
      })
      const data = await response.json()
      if (data.success) {
        alert("Report generated successfully!")
        fetchReports()
      }
    } catch (error) {
      console.error("Failed to generate report:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (reportId: number, format: string) => {
    try {
      const response = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, format }),
      })
      const data = await response.json()
      if (data.success && data.downloadUrl) {
        const link = document.createElement("a")
        link.href = data.downloadUrl
        link.download = data.fileName
        link.click()
      }
    } catch (error) {
      console.error("Failed to export report:", error)
    }
  }

  const calculateROI = async () => {
    try {
      const response = await fetch("/api/roi-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...roiParams }),
      })
      const data = await response.json()
      if (data.success) setRoi(data.data)
    } catch (error) {
      console.error("Failed to calculate ROI:", error)
    }
  }

  const taskData = [
    { status: "Completed", count: 42, color: "#00f6ff" },
    { status: "In Progress", count: 8, color: "#ff006e" },
    { status: "Pending", count: 5, color: "#00d084" },
  ]

  const COLORS = ["#00f6ff", "#ff006e", "#00d084"]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Advanced Analytics & Reporting
          </h2>
          <p className="text-muted-foreground mt-1">Generate reports, calculate ROI, and analyze performance</p>
        </div>
      </div>

      {/* ROI Calculator */}
      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            ROI Calculator
          </CardTitle>
          <CardDescription>Calculate return on investment with customizable parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Initial Investment ($)</Label>
              <Input
                type="number"
                value={roiParams.initialInvestment}
                onChange={(e) =>
                  setRoiParams({ ...roiParams, initialInvestment: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Monthly Revenue ($)</Label>
              <Input
                type="number"
                value={roiParams.monthlyRevenue}
                onChange={(e) =>
                  setRoiParams({ ...roiParams, monthlyRevenue: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Monthly Expenses ($)</Label>
              <Input
                type="number"
                value={roiParams.monthlyExpenses}
                onChange={(e) =>
                  setRoiParams({ ...roiParams, monthlyExpenses: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Growth Rate (%)</Label>
              <Input
                type="number"
                value={roiParams.growthRate}
                onChange={(e) => setRoiParams({ ...roiParams, growthRate: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Projection Period (months)</Label>
              <Input
                type="number"
                value={roiParams.months}
                onChange={(e) => setRoiParams({ ...roiParams, months: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={calculateROI} className="w-full bg-primary hover:bg-primary/90">
                Calculate ROI
              </Button>
            </div>
          </div>

          {roi && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-background p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Total ROI</p>
                  <p className="text-3xl font-bold text-primary">{roi.summary?.roi}%</p>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-500">${roi.summary?.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Total Profit</p>
                  <p className="text-3xl font-bold text-primary">${roi.summary?.totalProfit.toLocaleString()}</p>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Break Even</p>
                  <p className="text-3xl font-bold text-accent">Month {roi.summary?.breakEvenMonth}</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roi.projections || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                    labelStyle={{ color: "#00f6ff" }}
                  />
                  <Bar dataKey="revenue" fill="#00f6ff" />
                  <Bar dataKey="expenses" fill="#ff006e" />
                  <Bar dataKey="profit" fill="#00d084" />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </CardContent>
      </Card>

      {/* Report Generator */}
      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Custom Report Generator
          </CardTitle>
          <CardDescription>Generate reports with custom filters and date ranges</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={filters.reportType} onValueChange={(value) => setFilters({ ...filters, reportType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="tasks">Tasks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date To</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status Filter</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={generateReport} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
            <FileText className="w-4 h-4 mr-2" />
            {loading ? "Generating..." : "Generate Report"}
          </Button>

          {reports.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Recent Reports</h3>
              {reports.slice(0, 5).map((report: any) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                >
                  <div>
                    <p className="font-semibold text-foreground capitalize">
                      {report.report_type?.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportReport(report.id, "csv")}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportReport(report.id, "json")}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      JSON
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-primary/20">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  { month: "Jan", revenue: 2400 },
                  { month: "Feb", revenue: 3210 },
                  { month: "Mar", revenue: 2290 },
                  { month: "Apr", revenue: 2000 },
                  { month: "May", revenue: 2181 },
                  { month: "Jun", revenue: 2500 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
                <Line type="monotone" dataKey="revenue" stroke="#00f6ff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-primary/20">
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
