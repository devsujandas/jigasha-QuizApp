interface QuizResult {
  id: string
  category: string
  difficulty: string
  rawScore: number        // ✅ new field to keep original correct answers
  score: number           // ✅ penalized score
  totalQuestions: number
  percentage: number
  timestamp: number
  timeSpent: number
}

interface UserSettings {
  theme: string
  soundEnabled: boolean
  timerDuration: number
  shuffleQuestions: boolean
  fontSize: string
}

interface UserStats {
  totalScore: number
  gamesPlayed: number
  averageScore: number
  bestScore: number
  totalTimeSpent: number
  streakCurrent: number
  streakBest: number
  categoriesPlayed: string[]
  achievements: string[]
}

interface QuizData {
  version: string
  settings: UserSettings
  stats: UserStats
  history: QuizResult[]
  lastUpdated: number
}

const STORAGE_KEY = "jigasha-data"
const CURRENT_VERSION = "1.0.0"

const defaultSettings: UserSettings = {
  theme: "system",
  soundEnabled: true,
  timerDuration: 30,
  shuffleQuestions: true,
  fontSize: "medium",
}

const defaultStats: UserStats = {
  totalScore: 0,
  gamesPlayed: 0,
  averageScore: 0,
  bestScore: 0,
  totalTimeSpent: 0,
  streakCurrent: 0,
  streakBest: 0,
  categoriesPlayed: [],
  achievements: [],
}

const defaultData: QuizData = {
  version: CURRENT_VERSION,
  settings: defaultSettings,
  stats: defaultStats,
  history: [],
  lastUpdated: Date.now(),
}

class QuizStorage {
  private data: QuizData
  private isClient: boolean

  constructor() {
    this.isClient = typeof window !== "undefined"
    this.data = this.loadData()
    if (this.isClient) {
      this.migrateIfNeeded()
    }
  }

  private loadData(): QuizData {
    if (!this.isClient) {
      return { ...defaultData }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        return { ...defaultData }
      }

      const parsed = JSON.parse(stored) as QuizData

      if (!this.isValidData(parsed)) {
        console.warn("Invalid data structure, using defaults")
        return { ...defaultData }
      }

      return parsed
    } catch (error) {
      console.error("Error loading data:", error)
      return { ...defaultData }
    }
  }

  private isValidData(data: any): data is QuizData {
    return (
      data &&
      typeof data === "object" &&
      typeof data.version === "string" &&
      typeof data.settings === "object" &&
      typeof data.stats === "object" &&
      Array.isArray(data.history) &&
      typeof data.lastUpdated === "number"
    )
  }

  private migrateIfNeeded(): void {
    if (!this.isClient) return

    const oldTotalScore = localStorage.getItem("quiz-total-score")
    const oldGamesPlayed = localStorage.getItem("quiz-games-played")
    const oldSoundEnabled = localStorage.getItem("quiz-sound-enabled")
    const oldTimerDuration = localStorage.getItem("quiz-timer-duration")
    const oldShuffleQuestions = localStorage.getItem("quiz-shuffle-questions")
    const oldFontSize = localStorage.getItem("quiz-font-size")

    if (oldTotalScore || oldGamesPlayed) {
      this.data.stats.totalScore = Number.parseInt(oldTotalScore || "0")
      this.data.stats.gamesPlayed = Number.parseInt(oldGamesPlayed || "0")
      this.data.stats.averageScore =
        this.data.stats.gamesPlayed > 0
          ? Math.round((this.data.stats.totalScore / (this.data.stats.gamesPlayed * 10)) * 100)
          : 0

      if (oldSoundEnabled) this.data.settings.soundEnabled = oldSoundEnabled !== "false"
      if (oldTimerDuration) this.data.settings.timerDuration = Number.parseInt(oldTimerDuration)
      if (oldShuffleQuestions) this.data.settings.shuffleQuestions = oldShuffleQuestions !== "false"
      if (oldFontSize) this.data.settings.fontSize = oldFontSize

      const oldKeys = [
        "quiz-total-score",
        "quiz-games-played",
        "quiz-last-score",
        "quiz-last-total",
        "quiz-last-category",
        "quiz-last-difficulty",
        "quiz-sound-enabled",
        "quiz-timer-duration",
        "quiz-shuffle-questions",
        "quiz-font-size",
      ]
      oldKeys.forEach((key) => localStorage.removeItem(key))

      this.saveData()
    }
  }

  private saveData(): void {
    if (!this.isClient) return

    try {
      this.data.lastUpdated = Date.now()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (error) {
      console.error("Error saving data:", error)
    }
  }

  getSettings(): UserSettings {
    return { ...this.data.settings }
  }

  updateSettings(updates: Partial<UserSettings>): void {
    this.data.settings = { ...this.data.settings, ...updates }
    this.saveData()
  }

  getStats(): UserStats {
    return { ...this.data.stats }
  }

  // ✅ Negative marking applied here
  addQuizResult(result: Omit<QuizResult, "id" | "timestamp" | "percentage" | "rawScore">): void {
    const wrong = result.totalQuestions - result.score
    const penalty = Math.floor(wrong / 3)
    const effectiveScore = Math.max(0, result.score - penalty)

    const percentage = Math.round((effectiveScore / result.totalQuestions) * 100)

    const quizResult: QuizResult = {
      ...result,
      rawScore: result.score, // keep original correct answers
      score: effectiveScore,  // store penalized score
      id: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      percentage,
    }

    this.data.history.unshift(quizResult)

    if (this.data.history.length > 100) {
      this.data.history = this.data.history.slice(0, 100)
    }

    this.updateStats(quizResult)
    this.checkAchievements(quizResult)
    this.saveData()
  }

  private updateStats(result: QuizResult): void {
    const stats = this.data.stats

    stats.totalScore += result.score
    stats.gamesPlayed += 1

    const totalPercentage = this.data.history.reduce((sum, r) => sum + r.percentage, 0)
    stats.averageScore = Math.round(totalPercentage / stats.gamesPlayed)

    stats.bestScore = Math.max(stats.bestScore, result.percentage)
    stats.totalTimeSpent += result.timeSpent

    if (!stats.categoriesPlayed.includes(result.category)) {
      stats.categoriesPlayed.push(result.category)
    }

    if (result.percentage >= 70) {
      stats.streakCurrent += 1
      stats.streakBest = Math.max(stats.streakBest, stats.streakCurrent)
    } else {
      stats.streakCurrent = 0
    }
  }

  private checkAchievements(result: QuizResult): void {
    const achievements = this.data.stats.achievements
    const stats = this.data.stats
    const history = this.data.history

    if (stats.gamesPlayed === 1 && !achievements.includes("first-strike")) {
      achievements.push("first-strike")
    }

    if (result.percentage === 100 && !achievements.includes("brain-spark")) {
      achievements.push("brain-spark")
    }

    if (result.timeSpent < 60 && !achievements.includes("speed-demon")) {
      achievements.push("speed-demon")
    }

    if (stats.streakCurrent >= 3 && !achievements.includes("hot-streak")) {
      achievements.push("hot-streak")
    }

    if (stats.categoriesPlayed.length >= 5 && !achievements.includes("explorer")) {
      achievements.push("explorer")
    }

    if (stats.gamesPlayed >= 25 && !achievements.includes("quiz-veteran")) {
      achievements.push("quiz-veteran")
    }

    const perfectScores = history.filter((h) => h.percentage === 100).length
    if (perfectScores >= 3 && !achievements.includes("perfectionist")) {
      achievements.push("perfectionist")
    }

    const hour = new Date(result.timestamp).getHours()
    if (hour >= 0 && hour < 3 && !achievements.includes("night-owl")) {
      achievements.push("night-owl")
    }

    if (stats.totalScore >= 500 && !achievements.includes("grandmaster")) {
      achievements.push("grandmaster")
    }

    if (this.checkConsecutiveDays(7) && !achievements.includes("marathoner")) {
      achievements.push("marathoner")
    }
  }

  private checkConsecutiveDays(targetDays: number): boolean {
    if (this.data.history.length < targetDays) return false

    const today = new Date()
    const dates = new Set<string>()

    for (const result of this.data.history) {
      const resultDate = new Date(result.timestamp)
      const daysDiff = Math.floor((today.getTime() - resultDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff < targetDays) {
        dates.add(resultDate.toDateString())
      }
    }

    return dates.size >= targetDays
  }

  getHistory(limit?: number): QuizResult[] {
    return limit ? this.data.history.slice(0, limit) : [...this.data.history]
  }

  getLastResult(): QuizResult | null {
    return this.data.history[0] || null
  }

  exportData(): string {
    return JSON.stringify(this.data, null, 2)
  }

  importData(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData) as QuizData
      if (this.isValidData(imported)) {
        this.data = imported
        this.saveData()
        return true
      }
      return false
    } catch {
      return false
    }
  }

  clearAllData(): void {
    this.data = { ...defaultData }
    this.saveData()
  }

  clearHistory(): void {
    this.data.history = []
    this.saveData()
  }

  resetStats(): void {
    this.data.stats = { ...defaultStats }
    this.saveData()
  }

  resetSettings(): void {
    this.data.settings = { ...defaultSettings }
    this.saveData()
  }

  getAchievements(): string[] {
    return [...this.data.stats.achievements]
  }

  getAchievementInfo(id: string): { name: string; description: string; icon: string } | null {
    const achievements: Record<string, { name: string; description: string; icon: string }> = {
      "first-strike": { name: "First Strike", description: "Complete your very first quiz", icon: "🎯" },
      "brain-spark": { name: "Brain Spark", description: "Score 100% in any quiz", icon: "🧠" },
      "speed-demon": { name: "Speed Demon", description: "Finish a quiz in under 60 seconds", icon: "⚡" },
      "hot-streak": { name: "Hot Streak", description: "Win 3 quizzes in a row", icon: "🔥" },
      explorer: { name: "Explorer", description: "Play quizzes from 5 different categories", icon: "🗺️" },
      "quiz-veteran": { name: "Quiz Veteran", description: "Attempt 25 quizzes in total", icon: "🎖️" },
      perfectionist: { name: "Perfectionist", description: "Achieve a perfect score 3 times", icon: "💯" },
      "night-owl": { name: "Night Owl", description: "Play a quiz between midnight and 3 AM", icon: "🦉" },
      grandmaster: { name: "Grandmaster", description: "Reach 500 total points", icon: "👑" },
      marathoner: { name: "Marathoner", description: "Play quizzes 7 days in a row", icon: "🏃" },
    }
    return achievements[id] || null
  }
}

let storageInstance: QuizStorage | null = null

export function getStorage(): QuizStorage {
  if (!storageInstance) {
    storageInstance = new QuizStorage()
  }
  return storageInstance
}

export function getQuizSettings(): UserSettings {
  return getStorage().getSettings()
}

export function updateQuizSettings(updates: Partial<UserSettings>): void {
  getStorage().updateSettings(updates)
}

export function getQuizStats(): UserStats {
  return getStorage().getStats()
}

export function addQuizResult(result: Omit<QuizResult, "id" | "timestamp" | "percentage" | "rawScore">): void {
  getStorage().addQuizResult(result)
}

export function getQuizHistory(limit?: number): QuizResult[] {
  return getStorage().getHistory(limit)
}

export function getLastQuizResult(): QuizResult | null {
  return getStorage().getLastResult()
}
