"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Trophy, BarChart3, Settings, Clock, Target } from "lucide-react"
import { getQuizStats } from "@/lib/storage"
import { useEffect, useState } from "react"
import Image from "next/image"

interface HomePageProps {
  onStartQuiz: () => void
  onViewStats: () => void
  onOpenSettings: () => void
}

const HomePage = ({ onStartQuiz, onViewStats, onOpenSettings }: HomePageProps) => {
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    bestScore: 0,
    averageScore: 0,
    totalQuestions: 0,
    correctAnswers: 0,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStats(getQuizStats())
    }
  }, [])

  const categories = [
    {
      id: "entertainment_lifestyle",
      name: "Entertainment & Lifestyle",
      icon: "🎬",
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
    {
      id: "knowledge_society",
      name: "Knowledge & Society",
      icon: "🌍",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      id: "science_nature",
      name: "Science & Nature",
      icon: "🔬",
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
{/* Hero Section */}
<div className="relative px-6 pt-20 pb-16">
  <div className="text-center space-y-8 animate-fade-in">

    {/* Logo + Brand */}
    <div className="flex items-center justify-center gap-3">
  <Image
    src="/images/brain-logo.png"
    alt="JIGASHA Logo"
    width={48}
    height={48}
    className="w-12 h-12 drop-shadow-lg"
  />
  <span className="text-3xl sm:text-4xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
    JIGASHA
  </span>
</div>


    {/* Heading */}
    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-foreground leading-tight">
      Test Your Knowledge
    </h1>

    {/* Subtitle */}
    <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
      Challenge yourself with engaging questions and keep track of your progress along the way.
    </p>

    {/* CTA Button */}
    <Button
      onClick={onStartQuiz}
      size="lg"
      className="mt-8 px-10 py-4 text-lg font-semibold rounded-xl shadow-md hover:shadow-xl transition-transform duration-300 hover:scale-110"
    >
      <Play className="h-6 w-6 mr-2" />
      Start Quiz
    </Button>
  </div>
</div>


      {/* Quick Stats */}
      {stats.gamesPlayed > 0 && (
        <div className="px-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Your Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-stagger">
            <Card className="transition-smooth hover:shadow-md">
              <CardContent className="p-4 text-center">
                <Trophy className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.bestScore}</div>
                <div className="text-sm text-muted-foreground">Best Score</div>
              </CardContent>
            </Card>
            <Card className="transition-smooth hover:shadow-md">
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.gamesPlayed}</div>
                <div className="text-sm text-muted-foreground">Games Played</div>
              </CardContent>
            </Card>
            <Card className="transition-smooth hover:shadow-md">
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {Math.round((stats.correctAnswers / stats.totalQuestions) * 100) || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </CardContent>
            </Card>
            <Card className="transition-smooth hover:shadow-md">
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Categories Preview */}
      <div className="px-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Popular Categories</h2>
        <div className="grid gap-4 animate-stagger">
          {categories.map((category, index) => (
            <Card key={category.id} className="transition-smooth hover:shadow-md cursor-pointer" onClick={onStartQuiz}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{category.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">Test your knowledge in this category</p>
                  </div>
                  <Badge className={category.color}>Popular</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6">
        <div className="grid grid-cols-2 gap-4 animate-stagger">
          <Button
            variant="outline"
            onClick={onViewStats}
            className="h-16 flex-col gap-2 transition-smooth hover:bg-accent bg-transparent"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm">View Stats</span>
          </Button>
          <Button
            variant="outline"
            onClick={onOpenSettings}
            className="h-16 flex-col gap-2 transition-smooth hover:bg-accent bg-transparent"
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm">Settings</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export { HomePage }
export default HomePage
