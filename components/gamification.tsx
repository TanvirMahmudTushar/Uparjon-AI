"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Zap, Star, Users, Crown, Target, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Gamification({ userId = "1" }: { userId?: string }) {
  const [achievements, setAchievements] = useState<any[]>([])
  const [available, setAvailable] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [userRank, setUserRank] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [achRes, lbRes] = await Promise.all([
        fetch(`/api/gamification/achievements?userId=${userId}`),
        fetch(`/api/gamification/leaderboard?limit=10`),
      ])

      const achData = await achRes.json()
      const lbData = await lbRes.json()

      if (achData.success) {
        setAchievements(achData.achievements)
        setAvailable(achData.available)
        setStats(achData.stats)
      }
      if (lbData.success) {
        setLeaderboard(lbData.leaderboard)
        const userEntry = lbData.leaderboard.find((e: any) => e.user_id == userId)
        if (userEntry) {
          setUserRank(userEntry.rank)
        }
      }
    } catch (error) {
      console.error("Failed to fetch gamification data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getBadgeIcon = (icon: string) => {
    switch (icon) {
      case "trophy":
        return Trophy
      case "zap":
        return Zap
      case "star":
        return Star
      case "users":
        return Users
      default:
        return Target
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Crown className="w-12 h-12 text-primary animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Trophy className="w-8 h-8" />
            Gamification & Leaderboards
          </h2>
          <p className="text-muted-foreground mt-1">Track your achievements and compete with others</p>
        </div>
        <Button onClick={fetchData} className="bg-primary hover:bg-primary/90">
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Your Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-primary">#{userRank || "N/A"}</p>
            <p className="text-sm text-muted-foreground mt-2">Global Leaderboard</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-accent/20">
          <CardHeader>
            <CardTitle className="text-accent flex items-center gap-2">
              <Star className="w-5 h-5" />
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-accent">{stats?.totalPoints || 0}</p>
            <Progress value={((stats?.totalPoints || 0) % 1000) / 10} className="mt-4" />
          </CardContent>
        </Card>

        <Card className="bg-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Flame className="w-5 h-5" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-orange-500">
              {leaderboard.find((e) => e.user_id == userId)?.streak_days || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Days Active</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-accent/20">
          <CardHeader>
            <CardTitle className="text-accent flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-accent">
              {stats?.totalAchievements || 0}/{available.length}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Unlocked</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Your Achievements & Badges
          </CardTitle>
          <CardDescription>Unlock badges by completing milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {available.map((badge: any) => {
              const Icon = getBadgeIcon(badge.icon)
              const isUnlocked = achievements.some((a) => a.name === badge.name)
              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center p-6 rounded-lg border transition-all ${
                    isUnlocked
                      ? "bg-primary/10 border-primary shadow-lg shadow-primary/20"
                      : "bg-background border-border opacity-50"
                  }`}
                >
                  <Icon className={`w-12 h-12 mb-3 ${isUnlocked ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-sm font-semibold text-center text-foreground mb-1">{badge.name}</p>
                  <p className="text-xs text-muted-foreground text-center mb-2">{badge.description}</p>
                  <Badge variant={isUnlocked ? "default" : "secondary"} className="mt-2">
                    {badge.points} pts
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Global Leaderboard
          </CardTitle>
          <CardDescription>Top performers this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.map((entry: any, idx: number) => {
              const isCurrentUser = entry.user_id == userId
              const rankColors = ["text-yellow-500", "text-gray-400", "text-orange-600"]
              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    isCurrentUser
                      ? "bg-primary/10 border-2 border-primary/50 shadow-lg"
                      : "bg-background hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10">
                      {entry.rank <= 3 ? (
                        <Crown className={`w-8 h-8 ${rankColors[entry.rank - 1]}`} />
                      ) : (
                        <span className="font-bold text-primary text-lg">#{entry.rank}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground flex items-center gap-2">
                        {entry.name}
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {entry.streak_days} day streak
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-primary" />
                          {entry.tasks_completed} tasks
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-accent text-accent-foreground px-4 py-2 text-base">
                    {entry.total_points.toLocaleString()} pts
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
