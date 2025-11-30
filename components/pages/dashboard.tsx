"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Calendar, Users, DollarSign, Ticket } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useNotification } from "../notification-context"
import { dashboardApi, eventsApi, bookingsApi } from "@/services/api"

interface DashboardStats {
  totalTickets: number
  ticketsSold: number
  ticketsRemaining: number
  activeEvents: number
  totalRevenue: number
  pendingBookings: number
}

interface ChartData {
  name: string
  value: number
  revenue?: number
}

interface DashboardProps {
  onNavigateToEvents?: (filter: string) => void
}

export default function Dashboard({ onNavigateToEvents }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    ticketsSold: 0,
    ticketsRemaining: 0,
    activeEvents: 0,
    totalRevenue: 0,
    pendingBookings: 0,
  })
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotification()

  // Simulated data - replace with real API calls
  const chartData: ChartData[] = [
    { name: "Mon", value: 2400, revenue: 2210 },
    { name: "Tue", value: 1398, revenue: 2290 },
    { name: "Wed", value: 9800, revenue: 2000 },
    { name: "Thu", value: 3908, revenue: 2108 },
    { name: "Fri", value: 4800, revenue: 2176 },
    { name: "Sat", value: 3800, revenue: 2500 },
    { name: "Sun", value: 4300, revenue: 2100 },
  ]

  const [pieData, setPieData] = useState([
    { name: "Sold", value: 0 },
    { name: "Available", value: 0 },
  ])

  const COLORS = ["#1abc9c", "#3498db"]

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // Fetch events and participants data
        const [eventsResponse, participantsResponse] = await Promise.all([
          eventsApi.getAll(),
          bookingsApi.getAll(),
        ])

        if (eventsResponse.success && participantsResponse.success) {
          const events = eventsResponse.data || []
          const participants = participantsResponse.data || []

          // Calculate tickets sold (sum of all participants' total_booked)
          const ticketsSold = participants.reduce((sum: number, p: any) => sum + (p.total_booked || 0), 0)

          // Calculate total capacity (sum of all events' total_seat)
          const totalCapacity = events.reduce((sum: number, e: any) => sum + (e.total_seat || 0), 0)

          // Calculate tickets remaining
          const ticketsRemaining = totalCapacity - ticketsSold

          // Calculate active events (events happening today or within next 7 days)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const activeEvents = events.filter((e: any) => {
            if (!e.event_date) return false
            const eventDate = new Date(e.event_date)
            eventDate.setHours(0, 0, 0, 0)
            const daysDifference = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            return daysDifference >= 0 && daysDifference <= 7
          }).length

          // Calculate total revenue
          const totalRevenue = participants.reduce((sum: number, p: any) => sum + (p.payment || 0), 0)

          // Calculate pending bookings (participants with due > 0 or payment = 0)
          const pendingBookings = participants.filter((p: any) => {
            const payment = p.payment || 0
            const due = p.due || 0
            return payment === 0 || due > 0
          }).length

          setStats({
            totalTickets: totalCapacity,
            ticketsSold: ticketsSold,
            ticketsRemaining: ticketsRemaining,
            activeEvents: activeEvents,
            totalRevenue: totalRevenue,
            pendingBookings: pendingBookings,
          })

          // Update pie chart data
          if (totalCapacity > 0) {
            const soldPercentage = Math.round((ticketsSold / totalCapacity) * 100)
            const availablePercentage = 100 - soldPercentage
            setPieData([
              { name: "Sold", value: soldPercentage },
              { name: "Available", value: availablePercentage },
            ])
          } else {
            setPieData([
              { name: "Sold", value: 0 },
              { name: "Available", value: 0 },
            ])
          }

          addNotification("Dashboard Loaded", "All data has been synced successfully", "success")
        } else {
          addNotification("Error", "Failed to load dashboard data", "error")
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        addNotification("Error", "Failed to load dashboard data", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [addNotification])

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tickets Sold"
          value={loading ? "..." : stats.ticketsSold.toLocaleString()}
          icon={<Ticket className="w-6 h-6" />}
          trend={loading ? undefined : { 
            value: stats.totalTickets > 0 ? Math.round((stats.ticketsSold / stats.totalTickets) * 100) : 0, 
            up: true 
          }}
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Tickets Remaining"
          value={loading ? "..." : stats.ticketsRemaining.toLocaleString()}
          icon={<Ticket className="w-6 h-6" />}
          trend={loading ? undefined : { 
            value: stats.totalTickets > 0 ? Math.round((stats.ticketsRemaining / stats.totalTickets) * 100) : 0, 
            up: false 
          }}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Active Events"
          value={loading ? "..." : stats.activeEvents}
          icon={<Calendar className="w-6 h-6" />}
          trend={loading ? undefined : { value: 8, up: true }}
          color="from-accent to-green-500"
          onClick={() => onNavigateToEvents?.("Active")}
          clickable={true}
        />
        <StatCard
          title="Total Revenue"
          value={loading ? "..." : `${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tk`}
          icon={<DollarSign className="w-6 h-6" />}
          trend={loading ? undefined : { value: 23, up: true }}
          color="from-yellow-500 to-orange-500"
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Total Capacity"
          value={loading ? "..." : stats.totalTickets.toLocaleString()}
          icon={<Ticket className="w-6 h-6" />}
          color="from-primary to-blue-500"
        />
        <StatCard
          title="Pending Bookings"
          value={loading ? "..." : stats.pendingBookings}
          icon={<Users className="w-6 h-6" />}
          trend={loading ? undefined : { value: 5, up: false }}
          color="from-red-500 to-pink-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Weekly Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-accent)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Ticket Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Recent Events</h3>
        <div className="space-y-3">
          {[
            { event: "Summer Concert 2024", tickets: 342, status: "Sold Out" },
            { event: "Tech Conference 2024", tickets: 218, status: "Active" },
            { event: "Sports Tournament", tickets: 156, status: "Active" },
            { event: "Music Festival", tickets: 1200, status: "Coming Soon" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div>
                <p className="font-medium text-sm">{item.event}</p>
                <p className="text-xs text-muted-foreground">{item.tickets} tickets</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.status === "Sold Out"
                    ? "bg-red-100 text-red-700"
                    : item.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; up: boolean }
  color: string
  onClick?: () => void
  clickable?: boolean
}

function StatCard({ title, value, icon, trend, color, onClick, clickable }: StatCardProps) {
  return (
    <div 
      className={`bg-card border border-border rounded-lg p-6 ${clickable ? 'cursor-pointer hover:border-primary transition-all hover:shadow-lg' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.up ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-xs font-medium ${trend.up ? "text-green-500" : "text-red-500"}`}>
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color} text-white`}>{icon}</div>
      </div>
    </div>
  )
}
