"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { TaskSubmission } from "@/components/task-submission"
import { PaymentDashboard } from "@/components/payment-dashboard"
import { CreditScore } from "@/components/credit-score"
import { FraudDetection } from "@/components/fraud-detection"
import { AIChat } from "@/components/ai-chat"
import { WorkplaceAnalysis } from "@/components/workplace-analysis"
import { AIIntelligence } from "@/components/ai-intelligence"
import { Gamification } from "@/components/gamification"
import { AdvancedAnalytics } from "@/components/advanced-analytics"
import { SecurityCompliance } from "@/components/security-compliance"
import { IntegrationsAutomation } from "@/components/integrations-automation"
import { Web3Rewards } from "@/components/web3-rewards"

type Page =
  | "home"
  | "tasks"
  | "payments"
  | "credit"
  | "fraud"
  | "chat"
  | "analysis"
  | "intelligence"
  | "gamification"
  | "analytics"
  | "security"
  | "integrations"
  | "web3"

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState<Page>("home")
  const [userId, setUserId] = useState<number>(1)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setUserId(user.id)
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const renderPage = () => {
    switch (currentPage) {
      case "tasks":
        return <TaskSubmission userId={userId} />
      case "payments":
        return <PaymentDashboard userId={userId} />
      case "credit":
        return <CreditScore userId={userId} />
      case "fraud":
        return <FraudDetection userId={userId} />
      case "chat":
        return <AIChat userId={userId} />
      case "analysis":
        return <WorkplaceAnalysis userId={userId} />
      case "intelligence":
        return <AIIntelligence userId={userId.toString()} />
      case "gamification":
        return <Gamification userId={userId.toString()} />
      case "analytics":
        return <AdvancedAnalytics userId={userId.toString()} />
      case "security":
        return <SecurityCompliance userId={userId} />
      case "integrations":
        return <IntegrationsAutomation userId={userId} />
      case "web3":
        return <Web3Rewards userId={userId} />
      default:
        return <Dashboard userId={userId} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} userId={userId} onUserChange={setUserId} />
      <main className="flex-1 overflow-auto">{renderPage()}</main>
    </div>
  )
}
