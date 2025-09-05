"use client"

import { useState, useEffect } from "react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { HomePage } from "@/components/home-page"
import { QuizPage } from "@/components/quiz-page"
import { SettingsPage } from "@/components/settings-page"
import { ResultsPage } from "@/components/results-page"
import { StatisticsPage } from "@/components/statistics-page"
import { AchievementsPage } from "@/components/achievements-page"
import { getQuizStats } from "@/lib/storage"

const mergedCategories = [
  {
    id: "entertainment_lifestyle",
    name: "Entertainment & Lifestyle",
    icon: "🎭",
    subcategories: ["arts_and_literature", "film_and_tv", "music", "food_and_drink"],
    description: "Arts, movies, music & food",
  },
  {
    id: "knowledge_society",
    name: "Knowledge & Society",
    icon: "🏛️",
    subcategories: ["general_knowledge", "society_and_culture", "history", "geography"],
    description: "History, culture & geography",
  },
  {
    id: "science_nature",
    name: "Science & Nature",
    icon: "🔬",
    subcategories: ["science"],
    description: "Scientific discoveries & nature",
  },
  {
    id: "business_technology",
    name: "Business & Technology",
    icon: "💼",
    subcategories: [],
    description: "Business, tech & innovation",
  },
  {
    id: "mind_belief",
    name: "Mind & Belief",
    icon: "🧠",
    subcategories: [],
    description: "Philosophy & spirituality",
  },
  {
    id: "logic_medical",
    name: "Logic & Medical",
    icon: "⚕️",
    subcategories: ["sport_and_leisure"],
    description: "Logic, health & sports",
  },
]

const difficulties = [
  { id: "easy", name: "Easy", description: "Perfect for beginners" },
  { id: "medium", name: "Medium", description: "Balanced challenge" },
  { id: "hard", name: "Hard", description: "Expert level" },
]

export default function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium")
  const [stats, setStats] = useState({
    totalScore: 0,
    gamesPlayed: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
    streakCurrent: 0,
    streakBest: 0,
    categoriesPlayed: [],
    achievements: [],
  })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setStats(getQuizStats())
  }, [])

  useEffect(() => {
    if (currentPage === "home" && isClient) {
      setStats(getQuizStats())
    }
  }, [currentPage, isClient])

  const startQuiz = (category?: string, difficulty?: string) => {
    if (!category) {
      setCurrentPage("category-select")
      return
    }
    setSelectedCategory(category)
    setSelectedDifficulty(difficulty || selectedDifficulty)
    setCurrentPage("quiz")
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "quiz":
        return (
          <QuizPage
            category={selectedCategory}
            difficulty={selectedDifficulty}
            onComplete={() => setCurrentPage("results")}
            onBack={() => setCurrentPage("home")}
          />
        )
      case "results":
        return <ResultsPage onBack={() => setCurrentPage("home")} />
      case "statistics":
        return <StatisticsPage onBack={() => setCurrentPage("home")} />
      case "achievements":
        return <AchievementsPage onBack={() => setCurrentPage("home")} />
      case "settings":
        return <SettingsPage onBack={() => setCurrentPage("home")} />
      case "category-select":
        return (
          <div className="min-h-screen bg-background pb-20">
            <div className="px-6 pt-12 pb-8">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setCurrentPage("home")}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Select Category</h1>
                  <p className="text-sm text-muted-foreground">Choose your quiz topic</p>
                </div>
              </div>
            </div>

            <div className="px-6 space-y-8">
              {/* Difficulty Selection */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Difficulty Level</h2>
                <div className="grid grid-cols-3 gap-3">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty.id}
                      onClick={() => setSelectedDifficulty(difficulty.id)}
                      className={`p-4 rounded-xl border text-left transition-smooth ${
                        selectedDifficulty === difficulty.id
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-card hover:bg-accent border-border"
                      }`}
                    >
                      <div className="font-medium text-sm">{difficulty.name}</div>
                      <div
                        className={`text-xs mt-1 ${
                          selectedDifficulty === difficulty.id ? "text-primary-foreground/80" : "text-muted-foreground"
                        }`}
                      >
                        {difficulty.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Choose Category</h2>
                <div className="grid grid-cols-1 gap-4">
                  {mergedCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => startQuiz(category.id, selectedDifficulty)}
                      className="p-6 bg-card rounded-xl border hover:bg-accent transition-smooth text-left group flex items-center gap-4"
                    >
                      <div className="text-3xl group-hover:scale-110 transition-transform">{category.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground mb-1">{category.name}</div>
                        <div className="text-sm text-muted-foreground">{category.description}</div>
                      </div>
                      <div className="text-muted-foreground">→</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <HomePage
            onStartQuiz={() => startQuiz()}
            onViewStats={() => setCurrentPage("statistics")}
            onOpenSettings={() => setCurrentPage("settings")}
            onOpenAchievements={() => setCurrentPage("achievements")}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pb-20">{renderCurrentPage()}</div>
      <BottomNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  )
}
