"use client"

import { useRef, useEffect } from "react"
import { LogOut, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProfileDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileDropdown({ isOpen, onClose }: ProfileDropdownProps) {
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleProfileClick = () => {
    router.push("/profile")
    onClose()
  }

  const handleSettingsClick = () => {
    router.push("/settings")
    onClose()
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    router.push("/login")
    onClose()
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50"
    >
      <div className="p-3 border-b border-border">
        <p className="text-sm font-medium">Admin User</p>
        <p className="text-xs text-muted-foreground">admin@eventisa.com</p>
      </div>

      <div className="py-2">
        <button
          onClick={handleProfileClick}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors text-left"
        >
          <User className="w-4 h-4" />
          <span className="text-sm">Go to Profile</span>
        </button>

        <button
          onClick={handleSettingsClick}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors text-left"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </button>
      </div>

      <div className="border-t border-border p-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-100 hover:text-red-700 transition-colors text-left text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
