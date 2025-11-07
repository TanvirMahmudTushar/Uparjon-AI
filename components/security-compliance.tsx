"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AuditLog {
  id: number
  action: string
  resource: string
  details: string
  ip_address: string
  created_at: string
}

export function SecurityCompliance({ userId }: { userId: number }) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  useEffect(() => {
    fetchAuditLogs()
  }, [userId])

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch(`/api/security/audit-log?userId=${userId}`)
      const logs = await response.json()
      setAuditLogs(logs)
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
    }
  }

  const setup2FA = async () => {
    try {
      const response = await fetch("/api/security/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const data = await response.json()
      setBackupCodes(data.backupCodes)
      setTwoFAEnabled(true)
    } catch (error) {
      console.error("Failed to setup 2FA:", error)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Two-Factor Authentication</CardTitle>
            <CardDescription>Enhance your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge className={twoFAEnabled ? "bg-green-500" : "bg-gray-500"}>
                {twoFAEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <Button onClick={setup2FA} className="w-full bg-primary hover:bg-primary/90">
              {twoFAEnabled ? "Reconfigure 2FA" : "Enable 2FA"}
            </Button>
            {backupCodes.length > 0 && (
              <div className="bg-background p-3 rounded text-xs">
                <p className="font-semibold mb-2">Backup Codes (Save these!):</p>
                <div className="space-y-1">
                  {backupCodes.map((code, idx) => (
                    <p key={idx} className="font-mono text-muted-foreground">
                      {code}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-accent/20">
          <CardHeader>
            <CardTitle className="text-accent">Data Encryption</CardTitle>
            <CardDescription>Your data is protected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background rounded">
                <span className="text-sm">End-to-End Encryption</span>
                <Badge className="bg-green-500">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded">
                <span className="text-sm">SSL/TLS Protocol</span>
                <Badge className="bg-green-500">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded">
                <span className="text-sm">Data Backup</span>
                <Badge className="bg-green-500">Daily</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>Complete activity history for compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-background rounded border border-border text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">{log.action}</span>
                  <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Resource: {log.resource} | IP: {log.ip_address}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background rounded border border-green-500/50">
              <p className="text-sm font-semibold text-foreground">GDPR Compliant</p>
              <p className="text-xs text-muted-foreground mt-1">Data privacy standards met</p>
            </div>
            <div className="p-4 bg-background rounded border border-green-500/50">
              <p className="text-sm font-semibold text-foreground">SOC 2 Type II</p>
              <p className="text-xs text-muted-foreground mt-1">Security controls verified</p>
            </div>
            <div className="p-4 bg-background rounded border border-green-500/50">
              <p className="text-sm font-semibold text-foreground">ISO 27001</p>
              <p className="text-xs text-muted-foreground mt-1">Information security certified</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
