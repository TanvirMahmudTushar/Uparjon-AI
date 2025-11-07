"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Shield, Loader, CheckCircle } from "lucide-react"

interface FraudDetectionProps {
  userId: number
}

export function FraudDetection({ userId }: FraudDetectionProps) {
  const [fraudAnalysis, setFraudAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)

  const handleScan = async () => {
    try {
      setScanning(true)
      const response = await fetch("/api/fraud-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      })

      if (response.ok) {
        const data = await response.json()
        setFraudAnalysis(data)
      }
    } catch (error) {
      console.error("Failed to run fraud detection:", error)
    } finally {
      setScanning(false)
    }
  }

  const getRiskLevel = (risk: number) => {
    if (risk < 0.3) return { level: "Low", color: "text-success", bgColor: "bg-success/10" }
    if (risk < 0.6) return { level: "Medium", color: "text-warning", bgColor: "bg-warning/10" }
    return { level: "High", color: "text-danger", bgColor: "bg-danger/10" }
  }

  const riskLevel = fraudAnalysis ? getRiskLevel(fraudAnalysis.fraud_analysis?.fraud_risk || 0) : null

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Fraud Detection</h1>
        <p className="text-foreground/60">Monitor your account for suspicious activity</p>
      </div>

      {/* Scan Button */}
      <Button
        onClick={handleScan}
        disabled={scanning}
        className="bg-primary text-background hover:bg-primary-dark disabled:opacity-50"
      >
        {scanning ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Run Fraud Detection Scan
          </>
        )}
      </Button>

      {fraudAnalysis && (
        <>
          {/* Risk Level Card */}
          <Card className={`border-border p-6 ${riskLevel?.bgColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-sm mb-2">Overall Fraud Risk</p>
                <p className={`text-4xl font-bold ${riskLevel?.color}`}>
                  {(fraudAnalysis.fraud_analysis?.fraud_risk * 100).toFixed(0)}%
                </p>
                <p className={`text-lg font-medium mt-2 ${riskLevel?.color}`}>{riskLevel?.level} Risk</p>
              </div>
              {riskLevel?.level === "Low" ? (
                <CheckCircle className="w-16 h-16 text-success/50" />
              ) : (
                <AlertTriangle className="w-16 h-16 text-warning/50" />
              )}
            </div>
          </Card>

          {/* Red Flags */}
          {fraudAnalysis.fraud_analysis?.red_flags && fraudAnalysis.fraud_analysis.red_flags.length > 0 && (
            <Card className="bg-card border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Detected Red Flags
              </h2>
              <ul className="space-y-2">
                {fraudAnalysis.fraud_analysis.red_flags.map((flag: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-foreground/80">
                    <span className="text-warning font-bold">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Anomalies */}
          {fraudAnalysis.fraud_analysis?.anomalies && fraudAnalysis.fraud_analysis.anomalies.length > 0 && (
            <Card className="bg-card border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Detected Anomalies</h2>
              <ul className="space-y-2">
                {fraudAnalysis.fraud_analysis.anomalies.map((anomaly: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-foreground/80">
                    <span className="text-primary font-bold">•</span>
                    <span>{anomaly}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Security Recommendations */}
          <Card className="bg-card border-border p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Security Recommendations</h2>
            <ul className="space-y-3 text-foreground/80 text-sm">
              <li className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Keep your account credentials secure and unique</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Enable two-factor authentication when available</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Monitor your transactions regularly</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Report any suspicious activity immediately</span>
              </li>
            </ul>
          </Card>
        </>
      )}

      {!fraudAnalysis && (
        <Alert className="bg-primary/10 border-primary/30">
          <Shield className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            Click the button above to run a comprehensive fraud detection scan on your account.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
