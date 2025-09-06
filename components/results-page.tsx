"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, Target, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { getStorage, getLastQuizResult, getQuizStats } from "@/lib/storage"

interface ResultsPageProps {
  onBack: () => void
}

export function ResultsPage({ onBack }: ResultsPageProps) {
  const [lastResult, setLastResult] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const result = getLastQuizResult()
    const currentStats = getQuizStats()
    setLastResult(result)
    setStats(currentStats)
  }, [])

  if (!isClient || !lastResult || !stats) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading results...</div>
        </div>
      </div>
    )
  }

  const percentage = lastResult.percentage
  const averageScore = stats.averageScore

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: "Outstanding!", color: "text-green-600", icon: "🏆" }
    if (percentage >= 80) return { message: "Excellent!", color: "text-green-500", icon: "🌟" }
    if (percentage >= 70) return { message: "Great job!", color: "text-blue-500", icon: "👏" }
    if (percentage >= 60) return { message: "Good work!", color: "text-yellow-500", icon: "👍" }
    if (percentage >= 50) return { message: "Not bad!", color: "text-orange-500", icon: "💪" }
    return { message: "Keep practicing!", color: "text-red-500", icon: "📚" }
  }

  const performance = getPerformanceMessage()

  const resetProgress = () => {
    getStorage().clearAllData()
    setStats(getQuizStats())
    setLastResult(null)
  }

  // ✅ Format date safely
  const date = lastResult.timestamp ? new Date(lastResult.timestamp) : null
  const formattedDate =
    date && !isNaN(date.getTime())
      ? date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" })
      : "Unknown Date"
  const formattedTime =
    date && !isNaN(date.getTime())
      ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      : "Unknown Time"

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Trophy className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold">Quiz Results</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Latest Quiz Results */}
        <Card className="animate-fade-in">
          <CardHeader className="text-center space-y-2">
            <div className="text-4xl">{performance.icon}</div>
            <CardTitle className={cn("text-2xl font-semibold", performance.color)}>
              {performance.message}
            </CardTitle>

            {/* ✅ Results summary in clean blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="bg-accent/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Correct Answers</div>
                <div className="text-xl font-bold text-foreground">
                  {lastResult.rawScore}/{lastResult.totalQuestions}
                </div>
              </div>
              <div className="bg-accent/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Final Score</div>
                <div className="text-xl font-bold text-primary">
                  {lastResult.score}/{lastResult.totalQuestions}
                </div>
              </div>
              <div className="bg-accent/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">After Penalty</div>
                <div className="text-xl font-bold">{percentage}%</div>
              </div>
            </div>

            {/* ✅ Date + Time */}
            <div className="text-sm text-muted-foreground mt-4">
              {lastResult.difficulty} • {formattedDate} at {formattedTime}
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex justify-center gap-2 mb-4">
              <Badge variant="secondary" className="capitalize">
                {lastResult.category.replace(/_/g, " ")}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {lastResult.difficulty}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className={cn(
                  "h-3 rounded-full transition-all duration-1000 ease-out",
                  percentage >= 80 ? "bg-green-500" : percentage >= 60 ? "bg-yellow-500" : "bg-red-500",
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Overall Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Overall Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-accent/40">
                <div className="text-sm text-muted-foreground">Total Correct (after penalty)</div>
                <div className="text-xl font-bold text-primary">{stats.totalScore}</div>
              </div>
              <div className="p-3 rounded-lg bg-accent/40">
                <div className="text-sm text-muted-foreground">Games Played</div>
                <div className="text-xl font-bold">{stats.gamesPlayed}</div>
              </div>
              <div className="p-3 rounded-lg bg-accent/40">
                <div className="text-sm text-muted-foreground">Average Score</div>
                <div className="text-xl font-bold text-primary">{averageScore}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={onBack} className="w-full" size="lg">
            Play Again
          </Button>

          {stats.gamesPlayed > 0 && (
            <Button onClick={resetProgress} variant="outline" className="w-full bg-transparent" size="lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Progress
            </Button>
          )}
        </div>

        {/* Performance Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tips for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Try different categories to expand your knowledge</li>
              <li>• Practice with harder difficulty levels</li>
              <li>• Take your time to read questions carefully</li>
              <li>• Review incorrect answers to learn from mistakes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
