"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Integration {
  id: number
  service_name: string
  enabled: boolean
  created_at: string
}

interface Webhook {
  id: number
  event_type: string
  url: string
  active: boolean
}

export function IntegrationsAutomation({ userId }: { userId: number }) {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [newWebhookUrl, setNewWebhookUrl] = useState("")

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    try {
      const [intRes, whRes] = await Promise.all([
        fetch(`/api/integrations?userId=${userId}`),
        fetch(`/api/webhooks?userId=${userId}`),
      ])

      const integrations = await intRes.json()
      const webhooks = await whRes.json()

      setIntegrations(integrations)
      setWebhooks(webhooks)
    } catch (error) {
      console.error("Failed to fetch integration data:", error)
    }
  }

  const setupIntegration = async (service: string) => {
    try {
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          serviceName: service,
          apiKey: "demo_key_" + Math.random().toString(36).substr(2, 9),
          config: { connected: true },
        }),
      })

      if (response.ok) {
        fetchData()
        alert(`${service} connected successfully!`)
      }
    } catch (error) {
      console.error("Failed to setup integration:", error)
    }
  }

  const addWebhook = async () => {
    if (!newWebhookUrl) return

    try {
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          eventType: "task_completed",
          url: newWebhookUrl,
        }),
      })

      if (response.ok) {
        setNewWebhookUrl("")
        fetchData()
      }
    } catch (error) {
      console.error("Failed to add webhook:", error)
    }
  }

  const services = [
    { name: "Slack", icon: "💬", color: "bg-blue-500" },
    { name: "Microsoft Teams", icon: "👥", color: "bg-purple-500" },
    { name: "Google Calendar", icon: "📅", color: "bg-red-500" },
    { name: "Zapier", icon: "⚡", color: "bg-orange-500" },
  ]

  return (
    <div className="space-y-6 p-6">
      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Available Integrations</CardTitle>
          <CardDescription>Connect your favorite tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-4 bg-background rounded border border-border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{service.icon}</span>
                  <span className="font-semibold text-foreground">{service.name}</span>
                </div>
                <Button
                  onClick={() => setupIntegration(service.name)}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  Connect
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-accent/20">
        <CardHeader>
          <CardTitle className="text-accent">Connected Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-3 bg-background rounded">
                <span className="font-medium text-foreground">{integration.service_name}</span>
                <Badge className={integration.enabled ? "bg-green-500" : "bg-gray-500"}>
                  {integration.enabled ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle>Webhooks & Automation</CardTitle>
          <CardDescription>Trigger actions on events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Enter webhook URL"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-border rounded text-foreground text-sm"
            />
            <Button onClick={addWebhook} className="bg-primary hover:bg-primary/90">
              Add Webhook
            </Button>
          </div>

          <div className="space-y-2">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="p-3 bg-background rounded border border-border text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{webhook.event_type}</span>
                  <Badge className={webhook.active ? "bg-green-500" : "bg-gray-500"}>
                    {webhook.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 break-all">{webhook.url}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle>Task Automation</CardTitle>
          <CardDescription>Schedule recurring tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-primary hover:bg-primary/90">Daily Report</Button>
            <Button className="bg-accent hover:bg-accent/90">Weekly Sync</Button>
            <Button className="bg-primary hover:bg-primary/90">Monthly Review</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
