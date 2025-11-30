"use client"

import { useState } from "react"
import Sidebar from "./sidebar"
import TopBar from "./top-bar"
import Dashboard from "./pages/dashboard"
import Bookings from "./pages/bookings"
import Calendar from "./pages/calendar"
import Events from "./pages/events"
import Financial from "./pages/financial"
import Invoices from "./pages/invoices"
import Settings from "./pages/settings"
import PendingEvents from "./pages/pending-events"
import { NotificationProvider } from "./notification-context"

export default function DashboardLayout() {
  const [activePage, setActivePage] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [eventsFilter, setEventsFilter] = useState<string | null>(null)

  const handleSetActivePage = (page: string, filter?: string) => {
    setActivePage(page)
    setEventsFilter(filter || null)
  }

  const renderPage = () => {
    switch (activePage) {
      case "bookings":
        return <Bookings />
      case "calendar":
        return <Calendar />
      case "events":
        return <Events initialFilter={eventsFilter} />
      case "financial":
        return <Financial />
      case "invoices":
        return <Invoices />
      case "settings":
        return <Settings />
      case "pending-events":
        return <PendingEvents />
      default:
        return <Dashboard onNavigateToEvents={(filter) => handleSetActivePage("events", filter)} />
    }
  }

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar isOpen={sidebarOpen} onSetActivePage={setActivePage} activePage={activePage} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} activePage={activePage} />
          <main className="flex-1 overflow-auto">{renderPage()}</main>
        </div>
      </div>
    </NotificationProvider>
  )
}
