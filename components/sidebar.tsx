"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/custom-icons"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/components/auth-provider"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: any) => void
  userId: number
  onUserChange: (id: number) => void
}

export function Sidebar({ currentPage, onPageChange, userId, onUserChange }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    core: true,
    ai: true,
    advanced: true,
    web3: true,
  })
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const menuSections = [
    {
      id: "core",
      label: "Core Features",
      items: [
        { id: "home", label: "Home", icon: Icons.Home },
        { id: "tasks", label: "Tasks", icon: Icons.CheckCircle },
        { id: "payments", label: "Payments", icon: Icons.CreditCard },
        { id: "credit", label: "Credit Score", icon: Icons.TrendingUp },
        { id: "fraud", label: "Fraud Check", icon: Icons.AlertTriangle },
      ],
    },
    {
      id: "ai",
      label: "AI & Collaboration",
      items: [
        { id: "chat", label: "AI Chat", icon: Icons.MessageCircle },
        { id: "analysis", label: "Workplace Analytics", icon: Icons.BarChart3 },
        { id: "intelligence", label: "AI Intelligence", icon: Icons.Brain },
      ],
    },
    {
      id: "advanced",
      label: "Advanced Tools",
      items: [
        { id: "gamification", label: "Leaderboards", icon: Icons.Trophy },
        { id: "analytics", label: "Advanced Analytics", icon: Icons.LineChart },
        { id: "security", label: "Security & Compliance", icon: Icons.Lock },
        { id: "integrations", label: "Integrations", icon: Icons.Zap },
      ],
    },
    {
      id: "web3",
      label: "Web3 & Rewards",
      items: [{ id: "web3", label: "Crypto Rewards", icon: Icons.Coins }],
    },
  ]

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-border sticky top-0 bg-card">
        <h1 className="text-2xl font-bold text-primary">Uparjon AI</h1>
        <p className="text-xs text-foreground/60 mt-1">AI-Powered Fintech Platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4">
        {menuSections.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground/70 hover:text-foreground transition-colors"
            >
              {section.label}
              <Icons.ChevronDown
                className={`w-4 h-4 transition-transform ${expandedSections[section.id] ? "rotate-180" : ""}`}
              />
            </button>

            {expandedSections[section.id] && (
              <div className="space-y-1 mt-2">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPage === item.id
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 text-sm ${
                        isActive ? "bg-primary text-background hover:bg-primary/90" : "text-foreground hover:bg-card"
                      }`}
                      onClick={() => onPageChange(item.id)}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Selector */}
      <div className="p-4 border-t border-border space-y-3 sticky bottom-0 bg-card">
        {/* Theme Toggle */}
        <Button
          variant="outline"
          className="w-full justify-between text-foreground border-border hover:bg-card bg-transparent"
          onClick={toggleTheme}
        >
          <span className="flex items-center gap-2">
            {theme === "dark" ? <Icons.Sun className="w-4 h-4" /> : <Icons.Moon className="w-4 h-4" />}
            {theme === "dark" ? "Light" : "Dark"} Mode
          </span>
        </Button>

        {/* User Info */}
        <div className="px-3 py-2 bg-background rounded-lg border border-border">
          <p className="text-xs text-foreground/60">Logged in as</p>
          <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full text-foreground border-border hover:bg-card gap-2 bg-transparent"
          onClick={logout}
        >
          <Icons.LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
