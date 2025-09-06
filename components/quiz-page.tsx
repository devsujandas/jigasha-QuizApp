"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getQuizSettings, addQuizResult } from "@/lib/storage"

interface Question {
  id: string
  question: {
    text: string
  }
  correctAnswer: string
  incorrectAnswers: string[]
  category: string
  difficulty: string
}

interface QuizPageProps {
  category: string
  difficulty: string
  onComplete: () => void
  onBack: () => void
}

const categoryMappings = {
  entertainment_lifestyle: ["arts_and_literature", "film_and_tv", "music", "food_and_drink"],
  knowledge_society: ["general_knowledge", "society_and_culture", "history", "geography"],
  science_nature: ["science"],
  business_technology: [],
  mind_belief: [],
  logic_medical: ["sport_and_leisure"],
}

export function QuizPage({ category, difficulty, onComplete, onBack }: QuizPageProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isLoading, setIsLoading] = useState(true)
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([])
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([])
  const [isAnswerAnimating, setIsAnswerAnimating] = useState(false)
  const [quizStartTime, setQuizStartTime] = useState<number>(0)

  // Get timer duration from storage
  const getTimerDuration = () => {
    const settings = getQuizSettings()
    return settings.timerDuration
  }

  // Get question shuffle setting from storage
  const getShuffleSetting = () => {
    const settings = getQuizSettings()
    return settings.shuffleQuestions
  }

  // Fetch questions from Trivia API
  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true)

      const subcategories = categoryMappings[category as keyof typeof categoryMappings] || [category]
      const categoriesParam = subcategories.join(",")

      const response = await fetch(
        `https://the-trivia-api.com/v2/questions?limit=25&categories=${categoriesParam}&difficulties=${difficulty}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch questions")
      }

      const data = await response.json()

      // Shuffle questions if enabled
      const questionsToUse = getShuffleSetting() ? [...data].sort(() => Math.random() - 0.5) : data

      setQuestions(questionsToUse)
      setAnsweredQuestions(new Array(questionsToUse.length).fill(false))
      setTimeLeft(getTimerDuration())
    } catch (error) {
      console.error("Error fetching questions:", error)
      setQuestions([
        {
          id: "1",
          question: { text: "What is the capital of France?" },
          correctAnswer: "Paris",
          incorrectAnswers: ["London", "Berlin", "Madrid"],
          category: "geography",
          difficulty: "easy",
        },
        {
          id: "2",
          question: { text: "Which planet is known as the Red Planet?" },
          correctAnswer: "Mars",
          incorrectAnswers: ["Venus", "Jupiter", "Saturn"],
          category: "science",
          difficulty: "easy",
        },
      ])
      setAnsweredQuestions([false, false])
    } finally {
      setIsLoading(false)
    }
  }, [category, difficulty])

  // Shuffle answers for current question
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex]
      const allAnswers = [currentQuestion.correctAnswer, ...currentQuestion.incorrectAnswers]
      setShuffledAnswers([...allAnswers].sort(() => Math.random() - 0.5))
    }
  }, [questions, currentQuestionIndex])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !showResult && !selectedAnswer) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !selectedAnswer) {
      // Auto-submit when time runs out
      handleAnswerSelect("")
    }
  }, [timeLeft, showResult, selectedAnswer])

  // Load questions on mount and set start time
  useEffect(() => {
    fetchQuestions()
    setQuizStartTime(Date.now())
  }, [fetchQuestions])

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer || showResult) return

    setSelectedAnswer(answer)
    setShowResult(true)
    setIsAnswerAnimating(true)

    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = answer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase()

    let newScore = score
    if (isCorrect) {
      newScore = score + 1
      setScore(newScore)
      playSound("correct")
    } else {
      playSound("wrong")
    }

    // Mark question as answered
    const newAnsweredQuestions = [...answeredQuestions]
    newAnsweredQuestions[currentQuestionIndex] = true
    setAnsweredQuestions(newAnsweredQuestions)

    // Auto-advance after 2.5 seconds to allow for animations
    setTimeout(() => {
      setIsAnswerAnimating(false)
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
        setShowResult(false)
        setTimeLeft(getTimerDuration())
      } else {
        // ✅ Pass latest score here
        saveQuizResults(newScore)
        onComplete()
      }
    }, 2500)
  }

  const playSound = (type: "correct" | "wrong") => {
    const settings = getQuizSettings()
    if (!settings.soundEnabled) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      if (type === "correct") {
        // Success sound - cheerful ascending melody
        const frequencies = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)

          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1)
          oscillator.type = "sine"

          gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.1)
          gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + index * 0.1 + 0.05)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.3)

          oscillator.start(audioContext.currentTime + index * 0.1)
          oscillator.stop(audioContext.currentTime + index * 0.1 + 0.3)
        })
      } else {
        // Error sound - descending buzz
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
        oscillator.frequency.linearRampToValueAtTime(150, audioContext.currentTime + 0.3)
        oscillator.type = "sawtooth"

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      }
    } catch (error) {
      console.log("Audio context not available:", error)
    }
  }

  const saveQuizResults = (finalScore: number) => {
    // Save to localStorage
    const timeSpent = Math.round((Date.now() - quizStartTime) / 1000)

    addQuizResult({
      category,
      difficulty,
      score: finalScore, // ✅ latest score use hocche
      totalQuestions: questions.length,
      timeSpent,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Questions</h3>
            <p className="text-muted-foreground mb-4">Please check your internet connection and try again.</p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 pt-12 pb-6 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span
              className={cn(
                "font-mono text-sm font-semibold",
                timeLeft <= 10 && "text-destructive",
                timeLeft <= 5 && "animate-pulse",
              )}
            >
              {timeLeft}s
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium">
              Score: {score}/{questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="space-y-6">
          <div className="flex gap-2">
            <Badge variant="secondary" className="capitalize text-xs">
              {difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {currentQuestion.category.replace(/_/g, " ")}
            </Badge>
          </div>

          <h2 className="text-xl font-semibold leading-relaxed text-foreground">{currentQuestion.question.text}</h2>

          <div className="space-y-3">
            {shuffledAnswers.map((answer, index) => {
              const isSelected = selectedAnswer === answer
              const isCorrect = answer === currentQuestion.correctAnswer
              const showCorrectAnswer = showResult && isCorrect
              const showWrongAnswer = showResult && isSelected && !isCorrect

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(answer)}
                  disabled={showResult || selectedAnswer !== null}
                  className={cn(
                    "w-full p-4 text-left rounded-2xl border transition-all",
                    "hover:bg-muted disabled:cursor-not-allowed",
                    showCorrectAnswer && "bg-green-50 border-green-200 text-green-800",
                    showWrongAnswer && "bg-red-50 border-red-200 text-red-800",
                    isSelected && !showResult && "bg-primary/5 border-primary",
                    !showResult && !isSelected && "bg-card border-border hover:border-muted-foreground",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold",
                        showCorrectAnswer && "bg-green-500 border-green-500 text-white",
                        showWrongAnswer && "bg-red-500 border-red-500 text-white",
                        !showResult && "border-muted-foreground",
                      )}
                    >
                      {showCorrectAnswer && <CheckCircle className="h-4 w-4" />}
                      {showWrongAnswer && <XCircle className="h-4 w-4" />}
                      {!showResult && String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 font-medium">{answer}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {showResult && (
            <div className="mt-6 p-4 rounded-2xl bg-muted">
              <div className="flex items-center gap-2 mb-2">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-600">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-600">{selectedAnswer ? "Incorrect!" : "Time's up!"}</span>
                  </>
                )}
              </div>
              {selectedAnswer !== currentQuestion.correctAnswer && (
                <p className="text-sm text-muted-foreground">
                  The correct answer was: <strong className="text-foreground">{currentQuestion.correctAnswer}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
