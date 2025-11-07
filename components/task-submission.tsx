"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/lib/custom-icons"
import { VerificationModal } from "./verification-modal"

interface TaskSubmissionProps {
  userId: number
}

export function TaskSubmission({ userId }: TaskSubmissionProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("50")
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [userId])

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks/${userId}`)
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    try {
      setLoading(true)
      const response = await fetch("/api/tasks/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          description,
          amount: Number.parseFloat(amount),
        }),
      })

      if (response.ok) {
        setDescription("")
        setAmount("50")
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 3000)
        fetchTasks()
      }
    } catch (error) {
      console.error("Failed to submit task:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (taskId: number) => {
    try {
      setVerifying(taskId)
      setShowModal(true)
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId }),
      })

      if (response.ok) {
        const result = await response.json()
        setVerificationResult(result)
        fetchTasks()
      }
    } catch (error) {
      console.error("Failed to verify task:", error)
    } finally {
      setVerifying(null)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-bold text-foreground mb-2">Submit Tasks</h1>
        <p className="text-foreground/60">Submit your completed work for AI verification</p>
      </div>

      {submitted && (
        <Alert className="bg-success/10 border-success/30 animate-in fade-in slide-in-from-top-4">
          <Icons.CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-foreground">
            Task submitted successfully! It will be verified shortly.
          </AlertDescription>
        </Alert>
      )}

      {/* Submission Form */}
      <Card className="bg-card border-border p-6 animate-in fade-in slide-in-from-left-4 duration-500">
        <h2 className="text-xl font-bold text-foreground mb-4">New Task Submission</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Task Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task you completed..."
              className="w-full bg-background border border-border rounded-lg p-3 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="10"
              max="1000"
              className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !description.trim()}
            className="w-full bg-primary text-background hover:bg-primary-dark disabled:opacity-50 transition-all"
          >
            {loading ? "Submitting..." : "Submit Task"}
          </Button>
        </form>
      </Card>

      {/* Tasks List */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Your Tasks</h2>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <Card className="bg-card border-border p-6 text-center text-foreground/60 animate-in fade-in">
              No tasks submitted yet
            </Card>
          ) : (
            tasks.map((task, idx) => (
              <Card
                key={task.id}
                className="bg-card border-border p-4 animate-in fade-in slide-in-from-right-4"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{task.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-foreground/60">
                      <span>Status: {task.verification_status}</span>
                      <span>Payment: {task.payment_status}</span>
                      {task.ai_score > 0 && <span>Score: {(task.ai_score * 100).toFixed(0)}%</span>}
                    </div>
                  </div>
                  {task.verification_status === "pending" && (
                    <Button
                      onClick={() => handleVerify(task.id)}
                      disabled={verifying === task.id}
                      className="bg-primary text-background hover:bg-primary-dark transition-all"
                    >
                      {verifying === task.id ? (
                        <>
                          <Icons.Loader className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <VerificationModal
        isOpen={showModal}
        result={verificationResult}
        isLoading={verifying !== null}
        onClose={() => {
          setShowModal(false)
          setVerificationResult(null)
        }}
      />
    </div>
  )
}
