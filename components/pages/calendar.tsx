"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useNotification } from "../notification-context"

interface CalendarEvent {
  id: string
  title: string
  date: number
  type: "event" | "booking" | "maintenance"
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const { addNotification } = useNotification()

  useEffect(() => {
    // Simulate fetching events
    setTimeout(() => {
      setEvents([
        { id: "1", title: "Summer Concert", date: 15, type: "event" },
        { id: "2", title: "Tech Conference", date: 20, type: "event" },
        { id: "3", title: "System Maintenance", date: 10, type: "maintenance" },
        { id: "4", title: "Sports Tournament", date: 25, type: "event" },
      ])
      addNotification("Calendar Loaded", "Events have been synced", "success")
    }, 600)
  }, [addNotification])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" })
  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days: (number | null)[] = Array(firstDay).fill(null)

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "event":
        return "bg-primary text-primary-foreground"
      case "booking":
        return "bg-accent text-accent-foreground"
      case "maintenance":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Event Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{monthName}</h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-muted rounded transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleNextMonth} className="p-2 hover:bg-muted rounded transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <div
                key={idx}
                className="aspect-square p-2 rounded-lg border border-border flex flex-col items-center justify-start text-sm hover:bg-muted transition-colors"
              >
                {day && (
                  <>
                    <span className="font-medium">{day}</span>
                    {events
                      .filter((e) => e.date === day)
                      .slice(0, 2)
                      .map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs px-2 py-1 rounded mt-1 truncate ${getEventColor(event.type)}`}
                        >
                          {event.title}
                        </div>
                      ))}
                    {events.filter((e) => e.date === day).length > 2 && (
                      <span className="text-xs text-muted-foreground mt-1">
                        +{events.filter((e) => e.date === day).length - 2} more
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className={`p-3 rounded-lg ${getEventColor(event.type)}`}>
                <p className="font-medium text-sm">{event.title}</p>
                <p className="text-xs opacity-80">
                  {currentMonth.toLocaleString("default", { month: "short" })} {event.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
