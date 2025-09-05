"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Share2, Lock, CheckCircle, Trophy } from "lucide-react"
import { getStorage } from "@/lib/storage"

interface AchievementsPageProps {
  onBack: () => void
}

export function AchievementsPage({ onBack }: AchievementsPageProps) {
  const [achievements, setAchievements] = useState<string[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const storage = getStorage()
    setAchievements(storage.getAchievements())
    setStats(storage.getStats())
  }, [])

  const allAchievements = [
    {
      id: "first-strike",
      name: "First Strike",
      description: "Complete your very first quiz",
      icon: "🎯",
      requirement: "Complete 1 quiz",
    },
    {
      id: "brain-spark",
      name: "Brain Spark",
      description: "Score 100% in any quiz",
      icon: "🧠",
      requirement: "Score 100% on any quiz",
    },
    {
      id: "speed-demon",
      name: "Speed Demon",
      description: "Finish a quiz in under 60 seconds",
      icon: "⚡",
      requirement: "Complete quiz in under 60 seconds",
    },
    {
      id: "hot-streak",
      name: "Hot Streak",
      description: "Win 3 quizzes in a row",
      icon: "🔥",
      requirement: "Win 3 quizzes consecutively",
    },
    {
      id: "explorer",
      name: "Explorer",
      description: "Play quizzes from 5 different categories",
      icon: "🗺️",
      requirement: "Play 5 different categories",
    },
    {
      id: "quiz-veteran",
      name: "Quiz Veteran",
      description: "Attempt 25 quizzes in total",
      icon: "🎖️",
      requirement: "Complete 25 quizzes",
    },
    {
      id: "perfectionist",
      name: "Perfectionist",
      description: "Achieve a perfect score 3 times",
      icon: "💯",
      requirement: "Get 100% score 3 times",
    },
    {
      id: "night-owl",
      name: "Night Owl",
      description: "Play a quiz between midnight and 3 AM",
      icon: "🦉",
      requirement: "Play between 12 AM - 3 AM",
    },
    {
      id: "grandmaster",
      name: "Grandmaster",
      description: "Reach 500 total points",
      icon: "👑",
      requirement: "Earn 500 total points",
    },
    {
      id: "marathoner",
      name: "Marathoner",
      description: "Play quizzes 7 days in a row",
      icon: "🏃",
      requirement: "Play 7 consecutive days",
    },
  ]

  const shareAchievement = async (achievement: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `JIGASHA Achievement Unlocked!`,
          text: `I just earned the "${achievement.name}" badge in JIGASHA! ${achievement.description}`,
          url: window.location.origin,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const text = `I just earned the "${achievement.name}" badge in JIGASHA! ${achievement.description} - ${window.location.origin}`
      navigator.clipboard.writeText(text)
      alert("Achievement copied to clipboard!")
    }
  }

  const getProgress = (achievementId: string) => {
    if (!stats) return 0

    switch (achievementId) {
      case "first-strike":
        return Math.min(stats.gamesPlayed, 1)
      case "brain-spark":
        const perfectScores = stats.gamesPlayed > 0 ? (achievements.includes("brain-spark") ? 1 : 0) : 0
        return perfectScores
      case "speed-demon":
        return achievements.includes("speed-demon") ? 1 : 0
      case "hot-streak":
        return Math.min(stats.streakCurrent, 3)
      case "explorer":
        return Math.min(stats.categoriesPlayed?.length || 0, 5)
      case "quiz-veteran":
        return Math.min(stats.gamesPlayed, 25)
      case "perfectionist":
        // Count perfect scores from history if available, otherwise use achievement status
        return achievements.includes("perfectionist") ? 3 : 0
      case "night-owl":
        return achievements.includes("night-owl") ? 1 : 0
      case "grandmaster":
        return Math.min(stats.totalScore, 500)
      case "marathoner":
        return achievements.includes("marathoner") ? 7 : 0
      default:
        return achievements.includes(achievementId) ? 1 : 0
    }
  }

  const getMaxProgress = (achievementId: string) => {
    switch (achievementId) {
      case "hot-streak":
        return 3
      case "explorer":
        return 5
      case "quiz-veteran":
        return 25
      case "perfectionist":
        return 3
      case "grandmaster":
        return 500
      case "marathoner":
        return 7
      default:
        return 1
    }
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading achievements...</div>
        </div>
      </div>
    )
  }

  const unlockedCount = achievements.length
  const totalCount = allAchievements.length

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border-b border-border p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground animate-fade-in">Achievements</h1>
              <p className="text-muted-foreground animate-fade-in">
                {unlockedCount} of {totalCount} badges earned
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onBack} className="transition-smooth hover:bg-accent bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 mb-4 border border-border/50">
          <h2 className="text-lg font-semibold text-foreground mb-2">Welcome to Achievements! 🎉</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Track your quiz journey, unlock milestones, and collect unique badges as you grow from beginner to master.
            Each achievement marks your progress — can you earn them all?
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 border border-border/50">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Overall Progress</span>
            <span>{Math.round((unlockedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
          {allAchievements.map((achievement, index) => {
            const isUnlocked = achievements.includes(achievement.id)
            const progress = getProgress(achievement.id)
            const maxProgress = getMaxProgress(achievement.id)
            const progressPercentage = (progress / maxProgress) * 100

            return (
              <Card
                key={achievement.id}
                className={`transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  isUnlocked
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800 shadow-md"
                    : "bg-card hover:bg-accent/50 border-border"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="text-center pb-3">
                  <div className="text-4xl mb-2 relative transform transition-transform hover:scale-110">
                    {achievement.icon}
                    {isUnlocked ? (
                      <CheckCircle className="absolute -top-1 -right-1 h-5 w-5 text-green-600 bg-white rounded-full shadow-sm" />
                    ) : (
                      <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full shadow-lg flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <Lock className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg font-bold">{achievement.name}</CardTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">{achievement.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <Badge
                      variant={isUnlocked ? "default" : "secondary"}
                      className={`w-full justify-center font-medium ${
                        isUnlocked ? "bg-green-600 hover:bg-green-700" : ""
                      }`}
                    >
                      {isUnlocked ? "✓ Unlocked" : "🔒 Locked"}
                    </Badge>

                    {!isUnlocked && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span className="font-medium">
                            {progress}/{maxProgress}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                          {achievement.requirement}
                        </p>
                      </div>
                    )}

                    {isUnlocked && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareAchievement(achievement)}
                        className="w-full hover:bg-green-50 hover:border-green-300 transition-colors"
                      >
                        <Share2 className="h-3 w-3 mr-2" />
                        Share Achievement
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
