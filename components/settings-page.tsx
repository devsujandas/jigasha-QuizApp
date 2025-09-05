"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useTheme } from "next-themes"
import {
  ArrowLeft,
  Palette,
  Volume2,
  VolumeX,
  Clock,
  Shuffle,
  Trash2,
  RotateCcw,
  Type,
  Moon,
  Sun,
  Monitor,
  Trophy,
  Globe,
} from "lucide-react"
import { getStorage, getQuizSettings, updateQuizSettings } from "@/lib/storage"

interface SettingsPageProps {
  onBack: () => void
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState(getQuizSettings())
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    setSettings(getQuizSettings())
  }, [])

  useEffect(() => {
    if (mounted) {
      const root = document.documentElement
      root.classList.remove("font-small", "font-medium", "font-large")
      root.classList.add(`font-${settings.fontSize}`)
    }
  }, [settings.fontSize, mounted])

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    updateQuizSettings({ [key]: value })
  }

  const achievements = getStorage().getAchievements()

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-primary text-primary-foreground p-4">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>
    )
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
<div className="bg-background text-foreground p-4">
  <div className="flex items-center justify-between mb-2">
    <h1 className="text-xl font-bold">Settings</h1>
    <Button
      variant="outline"
      size="sm"
      onClick={onBack}
      className="flex items-center gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Quiz
    </Button>
  </div>
</div>



      <div className="p-4 space-y-4">
        {/* Achievements */}
        {achievements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements ({achievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {achievements.map((achievementId) => {
                  const achievement = getStorage().getAchievementInfo(achievementId)
                  if (!achievement) return null

                  return (
                    <div key={achievementId} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <span className="text-lg">{achievement.icon}</span>
                      <div>
                        <div className="text-sm font-medium">{achievement.name}</div>
                        <div className="text-xs text-muted-foreground">{achievement.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme Selection */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {getThemeIcon()}
                      <span className="capitalize">{theme}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Font Size */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Font Size</Label>
                <p className="text-sm text-muted-foreground">Adjust text size for better readability</p>
              </div>
              <Select value={settings.fontSize} onValueChange={(value) => handleSettingChange("fontSize", value)}>
                <SelectTrigger className="w-32">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      <span className="capitalize">{settings.fontSize}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quiz Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sound Effects */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Sound Effects</Label>
                <p className="text-sm text-muted-foreground">Play sounds for correct/incorrect answers</p>
              </div>
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(value) => handleSettingChange("soundEnabled", value)}
                />
              </div>
            </div>

            <Separator />

            {/* Timer Duration */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Timer Duration</Label>
                <p className="text-sm text-muted-foreground">Time limit per question</p>
              </div>
              <Select
                value={settings.timerDuration.toString()}
                onValueChange={(value) => handleSettingChange("timerDuration", Number.parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15s</SelectItem>
                  <SelectItem value="30">30s</SelectItem>
                  <SelectItem value="60">60s</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Question Shuffle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Shuffle Questions</Label>
                <p className="text-sm text-muted-foreground">Randomize question order</p>
              </div>
              <div className="flex items-center gap-2">
                <Shuffle className="h-4 w-4" />
                <Switch
                  checked={settings.shuffleQuestions}
                  onCheckedChange={(value) => handleSettingChange("shuffleQuestions", value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {/* Reset Progress */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="justify-start bg-transparent">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Progress
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Progress</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reset your progress? This will clear your scores but keep your settings.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        getStorage().resetStats()
                      }}
                    >
                      Reset Progress
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Clear All Data */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to clear all quiz data? This will permanently delete all your scores,
                      progress, and achievements. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        getStorage().clearAllData()
                        setSettings(getQuizSettings())
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear All Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Reset Settings */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="justify-start bg-transparent">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Settings
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Settings</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reset all settings to default? This will restore the original theme,
                      sound, timer, and other preferences.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        getStorage().resetSettings()
                        setSettings(getQuizSettings())
                        setTheme("system")
                      }}
                    >
                      Reset Settings
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle>About JIGASHA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center space-y-2">

            <div className="text-medium font-medium text-muted-foreground">A sleek and modern quiz platform designed to challenge your knowledge, track your progress with detailed insights, and reward you with unique achievements as you grow. </div>

              </div>

              <Separator />
<div className="space-y-3">
  <h4 className="text-sm font-medium text-foreground text-center">
    Connect with us
  </h4>

  <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-6">
    {/* Left Side Info */}
    <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:gap-6">
      <p className="text-xs text-muted-foreground">
        © 2025 Sujan Das. All rights reserved.
      </p>
      <p className="text-xs text-muted-foreground">Version 2.6.1</p>
    </div>

    {/* Social Buttons */}
    <div className="flex gap-3 mt-2 sm:mt-0">
      <Button
        variant="outline"
        size="icon"
        className="bg-transparent hover:bg-muted transition-colors"
        onClick={() => window.open("https://www.sujandas.info/", "_blank")}
      >
        <Globe className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="bg-transparent hover:bg-muted transition-colors"
        onClick={() => window.open("https://github.com/devsujandas", "_blank")}
      >
        <svg
          className="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
        </svg>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="bg-transparent hover:bg-muted transition-colors"
        onClick={() => window.open("http://instagram.com/devsujandas", "_blank")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9
           114.9 114.9-51.3 114.9-114.9S287.7 141 224.1 141zm0 190.7
            c-41.9 0-75.8-33.9-75.8-75.8s33.9-75.8 75.8-75.8 75.8 33.9
             75.8 75.8-33.9 75.8-75.8 75.8zm146.4-194.3 c0 14.9-12
              26.9-26.9 26.9s-26.9-12-26.9-26.9 12-26.9 26.9-26.9
               26.9 12 26.9 26.9zm76.1 27.2 c-1.7-35.9-9.9-67.7-36.2-93.9s-58-34.5-93.9-36.2
                C293.3 32 284.5 32 224 32s-69.3 0-92.6 1.7 c-35.9 1.7-67.7 9.9-93.9
                 36.2S3 111.8 1.3 147.7 C-.4 171 0 179.8 0 240.3s0 69.3 1.7 92.6 c1.7
                  35.9 9.9 67.7 36.2 93.9s58 34.5 93.9 36.2 c23.3 1.7 32.1 1.7 92.6 1.7s69.3
                   0 92.6-1.7 c35.9-1.7 67.7-9.9 93.9-36.2s34.5-58 36.2-93.9
                    c1.7-23.3 1.7-32.1 1.7-92.6s0-69.3-1.7-92.6zm-48.1 224c-7.8
                     19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.4 9s-102.9
                      2.6-132.4-9c-19.6-7.8-34.7-22.9-42.6-42.6 -11.7-29.5-9-99.5-9-132.4s-2.6-102.9
                       9-132.4 c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.4-9s102.9-2.6 132.4
                        9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.4s2.7 102.9-9 132.4z"/>
        </svg>
      </Button>
    </div>
  </div>
</div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
