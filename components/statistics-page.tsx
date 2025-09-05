"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3, Trophy, TrendingUp, Target, User, Clock } from "lucide-react"
import { getQuizStats, getQuizHistory } from "@/lib/storage"

interface StatisticsPageProps {
  onBack: () => void
}

export function StatisticsPage({ onBack }: StatisticsPageProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState(getQuizStats())
  const [history, setHistory] = useState(getQuizHistory())
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setStats(getQuizStats())
    setHistory(getQuizHistory())
  }, [])

  const getAccuracyStats = () => {
    if (history.length === 0) return { accuracy: 0, totalQuestions: 0, correctAnswers: 0 }

    const totalQuestions = history.reduce((sum, game) => sum + game.totalQuestions, 0)
    const correctAnswers = history.reduce((sum, game) => sum + game.score, 0)
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

    return { accuracy, totalQuestions, correctAnswers }
  }

  const accuracyStats = getAccuracyStats()

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading statistics...</div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "high-scores", label: "High Scores" },
    { id: "recent-games", label: "Recent Games" },
  ]

  const getFavoriteCategory = () => {
    if (history.length === 0) return "None"
    const categoryCount: { [key: string]: number } = {}
    history.forEach((game) => {
      categoryCount[game.category] = (categoryCount[game.category] || 0) + 1
    })
    const favorite = Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]
    return favorite ? favorite[0].replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "None"
  }

  const getHighScores = () => {
    return history.sort((a, b) => b.score - a.score).slice(0, 10)
  }

  const getRecentGames = () => {
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
  }

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
      <Card className="transition-smooth hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-muted-foreground">Total Quizzes</h3>
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">{stats.gamesPlayed}</div>
          <div className="text-sm text-muted-foreground">Quizzes completed</div>
        </CardContent>
      </Card>

      <Card className="transition-smooth hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-muted-foreground">Best Score</h3>
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">{stats.bestScore}</div>
          <div className="text-sm text-muted-foreground">Highest points earned</div>
        </CardContent>
      </Card>

      <Card className="transition-smooth hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-muted-foreground">Average Score</h3>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">{stats.averageScore}</div>
          <div className="text-sm text-muted-foreground">Points per quiz</div>
        </CardContent>
      </Card>

      <Card className="transition-smooth hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-muted-foreground">Accuracy</h3>
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">{accuracyStats.accuracy}%</div>
          <div className="text-sm text-muted-foreground">
            {accuracyStats.correctAnswers} / {accuracyStats.totalQuestions} correct
          </div>
        </CardContent>
      </Card>

      <Card className="transition-smooth hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-muted-foreground">Favorite Category</h3>
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{getFavoriteCategory()}</div>
          <div className="text-sm text-muted-foreground">Most played category</div>
        </CardContent>
      </Card>

      <Card className="transition-smooth hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-muted-foreground">Total Questions</h3>
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">{accuracyStats.totalQuestions}</div>
          <div className="text-sm text-muted-foreground">Questions answered</div>
        </CardContent>
      </Card>
    </div>
  )

  const renderHighScores = () => (
    <div className="space-y-3 animate-fade-in">
      {getHighScores().length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No high scores yet. Start playing to see your best results!</p>
          </CardContent>
        </Card>
      ) : (
        getHighScores().map((game, index) => (
          <Card key={index} className="bg-card border-border animate-card-hover transition-smooth hover:bg-accent/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {game.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {game.difficulty} • {new Date(game.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{game.score}</div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round((game.score / game.totalQuestions) * 100)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )

  const renderRecentGames = () => (
    <div className="space-y-3 animate-fade-in">
      {getRecentGames().length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No recent games. Start playing to see your game history!</p>
          </CardContent>
        </Card>
      ) : (
        getRecentGames().map((game, index) => (
          <Card key={index} className="bg-card border-border animate-card-hover transition-smooth hover:bg-accent/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">
                    {game.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {game.difficulty} • {new Date(game.date).toLocaleDateString()} at{" "}
                    {new Date(game.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">
                    {game.score}/{game.totalQuestions}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round((game.score / game.totalQuestions) * 100)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "high-scores":
        return renderHighScores()
      case "recent-games":
        return renderRecentGames()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary animate-fade-in">Quiz Statistics</h1>
            <p className="text-muted-foreground animate-fade-in">Track your progress and achievements</p>
          </div>
          <Button variant="outline" onClick={onBack} className="transition-smooth hover:bg-accent bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quiz
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border-b border-border px-6 animate-fade-in">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-smooth ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">{renderTabContent()}</div>
    </div>
  )
}
