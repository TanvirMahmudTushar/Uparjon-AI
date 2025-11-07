"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, CheckCircle, Loader } from "lucide-react"

interface PaymentDashboardProps {
  userId: number
}

export function PaymentDashboard({ userId }: PaymentDashboardProps) {
  const [tasks, setTasks] = useState<any[]>([])
  const [processing, setProcessing] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [userId])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tasks/${userId}`)
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (taskId: number) => {
    try {
      setProcessing(taskId)
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId }),
      })

      if (response.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error("Failed to process payment:", error)
    } finally {
      setProcessing(null)
    }
  }

  const verifiedTasks = tasks.filter((t) => t.verification_status === "verified")
  const totalEarnings = verifiedTasks.reduce((sum, t) => sum + 50, 0)

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-foreground/60">Loading payments...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Payments</h1>
        <p className="text-foreground/60">Manage your earnings and payment methods</p>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border p-6">
          <p className="text-foreground/60 text-sm">Total Earnings</p>
          <p className="text-3xl font-bold text-primary mt-2">${totalEarnings}</p>
        </Card>

        <Card className="bg-card border-border p-6">
          <p className="text-foreground/60 text-sm">Verified Tasks</p>
          <p className="text-3xl font-bold text-success mt-2">{verifiedTasks.length}</p>
        </Card>

        <Card className="bg-card border-border p-6">
          <p className="text-foreground/60 text-sm">Pending Payments</p>
          <p className="text-3xl font-bold text-warning mt-2">
            {tasks.filter((t) => t.payment_status === "unpaid" && t.verification_status === "verified").length}
          </p>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Payment Methods</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">bKash</p>
                <p className="text-sm text-foreground/60">Primary payment method</p>
              </div>
            </div>
            <span className="text-success text-sm font-medium">Connected</span>
          </div>
        </div>
      </Card>

      {/* Pending Payments */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Ready for Payment</h2>
        <div className="space-y-3">
          {verifiedTasks.filter((t) => t.payment_status === "unpaid").length === 0 ? (
            <Card className="bg-card border-border p-6 text-center text-foreground/60">No pending payments</Card>
          ) : (
            verifiedTasks
              .filter((t) => t.payment_status === "unpaid")
              .map((task) => (
                <Card key={task.id} className="bg-card border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground font-medium">{task.description}</p>
                      <p className="text-sm text-foreground/60 mt-1">Amount: $50.00</p>
                    </div>
                    <Button
                      onClick={() => handlePayment(task.id)}
                      disabled={processing === task.id}
                      className="bg-success text-background hover:bg-success/90"
                    >
                      {processing === task.id ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Pay Now
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))
          )}
        </div>
      </div>

      {/* Payment History */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Payment History</h2>
        <div className="space-y-3">
          {tasks.filter((t) => t.payment_status === "paid").length === 0 ? (
            <Card className="bg-card border-border p-6 text-center text-foreground/60">No payment history yet</Card>
          ) : (
            tasks
              .filter((t) => t.payment_status === "paid")
              .map((task) => (
                <Card key={task.id} className="bg-card border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground font-medium">{task.description}</p>
                      <p className="text-sm text-foreground/60 mt-1">$50.00 via bKash</p>
                    </div>
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  </div>
                </Card>
              ))
          )}
        </div>
      </div>
    </div>
  )
}
