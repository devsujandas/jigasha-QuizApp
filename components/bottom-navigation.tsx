"use client"

import { Button } from "@/components/ui/button"
import { Home, Brain, BarChart3, Settings, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export function BottomNavigation({ currentPage, onPageChange }: BottomNavigationProps) {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "quiz", label: "Quiz", icon: Brain },
    { id: "achievements", label: "Badges", icon: Trophy },
    { id: "statistics", label: "Stats", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-0 transition-all duration-200",
                isActive && "bg-primary text-primary-foreground shadow-sm",
              )}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
              <span
                className={cn("text-xs font-medium", isActive ? "text-primary-foreground" : "text-muted-foreground")}
              >
                {item.label}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
