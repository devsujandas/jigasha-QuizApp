"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Trophy, BarChart3, Settings, Clock, Target } from "lucide-react"
import { getQuizStats, getQuizHistory } from "@/lib/storage"
import { useEffect, useState } from "react"
import Image from "next/image"

interface HomePageProps {
  onStartQuiz: () => void
  onViewStats: () => void
  onOpenSettings: () => void
}

const HomePage = ({ onStartQuiz, onViewStats, onOpenSettings }: HomePageProps) => {
  const [stats, setStats] = useState(getQuizStats())
  const [accuracy, setAccuracy] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    if (typeof window !== "undefined") {
      const newStats = getQuizStats()
      const history = getQuizHistory()

      // ✅ Accuracy should use rawScore (not penalized score)
      const totalQ = history.reduce((sum, game) => sum + game.totalQuestions, 0)
      const correct = history.reduce(
        (sum, game) => sum + (game.rawScore ?? game.score),
        0
      )
      const acc = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0

      setStats(newStats)
      setAccuracy(acc)
      setTotalQuestions(totalQ)
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
          <div className="flex items-center justify-center ">
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
      {isClient && stats.gamesPlayed > 0 && (
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
                <div className="text-2xl font-bold text-foreground">{accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </CardContent>
            </Card>
            <Card className="transition-smooth hover:shadow-md">
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{totalQuestions}</div>
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
          {categories.map((category) => (
            <Card
              key={category.id}
              className="transition-smooth hover:shadow-md cursor-pointer"
              onClick={onStartQuiz}
            >
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
            onClick={() => window.location.href = "/badges"}
            className="h-16 flex-col gap-2 transition-smooth hover:bg-accent bg-transparent"
            >
            <Trophy className="h-5 w-5" />
            <span className="text-sm">Badges</span>
            </Button>
        </div>
      </div>

{/* How to Play Section */}
<div className="px-6 mt-12 mb-12">
  <h2 className="text-xl font-semibold mb-8 text-left text-foreground">
    How to Play
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-stagger">
    <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
      <CardContent className="p-6 text-center space-y-3">
        <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Target className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="font-semibold text-foreground">Earn Points</h3>
        <p className="text-sm text-muted-foreground">
          Each correct answer gives <span className="font-bold text-green-600">+1 point</span>.
        </p>
      </CardContent>
    </Card>

    <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
      <CardContent className="p-6 text-center space-y-3">
        <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <Trophy className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="font-semibold text-foreground">Beware of Penalty</h3>
        <p className="text-sm text-muted-foreground">
          Each wrong answer deducts <span className="font-bold text-red-500">−0.25 points</span>.
        </p>
      </CardContent>
    </Card>

    <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
      <CardContent className="p-6 text-center space-y-3">
        <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
          <Clock className="h-6 w-6 text-yellow-500" />
        </div>
        <h3 className="font-semibold text-foreground">Time Matters</h3>
        <p className="text-sm text-muted-foreground">
          Finish all questions within the timer to score better.
        </p>
      </CardContent>
    </Card>

    <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
      <CardContent className="p-6 text-center space-y-3">
        <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
          <BarChart3 className="h-6 w-6 text-indigo-500" />
        </div>
        <h3 className="font-semibold text-foreground">Track Progress</h3>
        <p className="text-sm text-muted-foreground">
          View stats, accuracy & achievements in your dashboard.
        </p>
      </CardContent>
    </Card>
  </div>
</div>


    </div>
  )
}

export { HomePage }
export default HomePage
