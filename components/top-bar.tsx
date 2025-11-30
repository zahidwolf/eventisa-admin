"use client"

import { useState } from "react"
import { Menu, Search } from "lucide-react"
import { NotificationDropdown } from "./notification-dropdown"
import ProfileDropdown from "./profile-dropdown"

interface TopBarProps {
  onToggleSidebar: () => void
  activePage: string
}

export default function TopBar({ onToggleSidebar, activePage }: TopBarProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const pageTitle = activePage.charAt(0).toUpperCase() + activePage.slice(1)

  return (
    <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-foreground">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <NotificationDropdown />

        <div className="relative flex items-center gap-3 pl-4 border-l border-border">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold cursor-pointer">
              EA
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-muted-foreground">Eventisa</p>
            </div>
          </button>
          {showProfileDropdown && <ProfileDropdown onClose={() => setShowProfileDropdown(false)} />}
        </div>
      </div>
    </div>
  )
}
