"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
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
import { TrendingUp } from "lucide-react"
import { financialApi } from "@/services/api"

interface FinancialData {
  totalRevenue: number
  totalRefunds: number
  netIncome: number
  averageTicketPrice: number
}

export default function Financial() {
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalRevenue: 0,
    totalRefunds: 0,
    netIncome: 0,
    averageTicketPrice: 0,
  })
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotification()

  const expenseData = [
    { name: "Operations", value: 30 },
    { name: "Marketing", value: 25 },
    { name: "Staff", value: 35 },
    { name: "Equipment", value: 10 },
  ]

  const COLORS = ["#1abc9c", "#3498db", "#f39c12", "#e74c3c"]

  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true)
      const summaryResponse = await financialApi.getSummary()
      const trendResponse = await financialApi.getRevenueTrend("monthly")

      if (summaryResponse.success && summaryResponse.data) {
        setFinancialData(summaryResponse.data)
      }

      if (trendResponse.success && Array.isArray(trendResponse.data)) {
        setRevenueData(trendResponse.data)
      }

      addNotification("Financial Data Updated", "Latest financial metrics loaded", "success")
      setLoading(false)
    }

    fetchFinancialData()
  }, [addNotification])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Financial Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinancialCard
          title="Total Revenue"
          value={`$${(financialData.totalRevenue / 1000).toFixed(1)}K`}
          change={12}
          color="from-green-500 to-emerald-500"
        />
        <FinancialCard
          title="Total Refunds"
          value={`$${(financialData.totalRefunds / 1000).toFixed(1)}K`}
          change={-5}
          color="from-red-500 to-pink-500"
        />
        <FinancialCard
          title="Net Income"
          value={`$${(financialData.netIncome / 1000).toFixed(1)}K`}
          change={18}
          color="from-primary to-blue-500"
        />
        <FinancialCard
          title="Avg Ticket Price"
          value={`$${financialData.averageTicketPrice}`}
          change={3}
          color="from-accent to-teal-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Revenue Trend</h3>
          {loading || revenueData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Loading chart data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="var(--color-primary)" />
                <Bar dataKey="refunds" fill="var(--color-destructive)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: "2024-11-05", desc: "Concert Ticket Sales", amount: 4500, type: "Income" },
                { date: "2024-11-04", desc: "Refund Processed", amount: -250, type: "Refund" },
                { date: "2024-11-03", desc: "Conference Registration", amount: 3200, type: "Income" },
                { date: "2024-11-02", desc: "Operational Expense", amount: -1000, type: "Expense" },
              ].map((tx, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted">
                  <td className="px-4 py-3">{tx.date}</td>
                  <td className="px-4 py-3">{tx.desc}</td>
                  <td className={`px-4 py-3 font-medium ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                    ${Math.abs(tx.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        tx.type === "Income"
                          ? "bg-green-100 text-green-700"
                          : tx.type === "Refund"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

interface FinancialCardProps {
  title: string
  value: string
  change: number
  color: string
}

function FinancialCard({ title, value, change, color }: FinancialCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <p className="text-muted-foreground text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <div className="flex items-center gap-1 mt-2">
        <TrendingUp className={`w-4 h-4 ${change > 0 ? "text-green-500" : "text-red-500"}`} />
        <span className={`text-xs font-medium ${change > 0 ? "text-green-500" : "text-red-500"}`}>
          {change > 0 ? "+" : ""}
          {change}%
        </span>
      </div>
    </div>
  )
}
