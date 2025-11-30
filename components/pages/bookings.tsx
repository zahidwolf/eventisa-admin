"use client"

import { useEffect, useState } from "react"
import { Plus, Download, Eye, Edit, Trash2 } from "lucide-react"
import { useNotification } from "../notification-context"
import { bookingsApi } from "@/services/api"

interface Booking {
  id: string
  customerName: string
  email: string
  event: string
  tickets: number
  total: number
  status: "Confirmed" | "Pending" | "Cancelled"
  date: string
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("All")
  const { addNotification } = useNotification()

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true)
      const response = await bookingsApi.getAll()

      if (response.success && Array.isArray(response.data)) {
        // Transform participant data to booking format
        const transformedBookings: Booking[] = response.data
          .filter((participant: any) => participant != null) // Filter out null/undefined
          .map((participant: any) => {
            try {
              // Determine status based on payment
              let status: "Confirmed" | "Pending" | "Cancelled" = "Pending"
              const payment = parseFloat(participant.payment) || 0
              const due = parseFloat(participant.due) || 0
              
              if (payment > 0) {
                status = due > 0 ? "Pending" : "Confirmed"
              } else {
                status = "Pending"
              }

              // Format date
              let paymentDate = new Date().toISOString().split('T')[0]
              if (participant.payment_date) {
                try {
                  paymentDate = new Date(participant.payment_date).toISOString().split('T')[0]
                } catch (e) {
                  console.warn("Invalid payment_date:", participant.payment_date)
                }
              }

              return {
                id: `INV-${String(participant.id || 0).padStart(6, '0')}`,
                customerName: participant.user?.name || participant.user_name || "Guest User",
                email: participant.user?.email || participant.user_email || "N/A",
                event: participant.event?.event_title || participant.event_title || "Unknown Event",
                tickets: parseInt(participant.total_booked) || 0,
                total: payment,
                status: status,
                date: paymentDate,
              }
            } catch (error) {
              console.error("Error transforming participant:", participant, error)
              return null
            }
          })
          .filter((booking: Booking | null) => booking != null) as Booking[]
        
        setBookings(transformedBookings)
        addNotification("Bookings Loaded", `Loaded ${transformedBookings.length} bookings`, "success")
      } else {
        console.error("Failed to fetch bookings:", response.error, response)
        addNotification("Error", response.error || "Failed to load bookings", "error")
        setBookings([])
      }
      setLoading(false)
    }

    fetchBookings()
  }, [addNotification])

  const handleDelete = async (id: string) => {
    // Extract participant ID from booking ID (format: INV-000001)
    const participantId = id.replace('INV-', '')
    
    const response = await bookingsApi.delete(participantId)
    if (response.success) {
      setBookings(bookings.filter((b) => b.id !== id))
      addNotification("Booking Deleted", `Booking ${id} has been removed`, "info")
    } else {
      addNotification("Error", response.error || "Failed to delete booking", "error")
    }
  }

  const handleExport = () => {
    addNotification("Export Started", "Bookings data is being exported to CSV", "success")
  }

  const filteredBookings = filterStatus === "All" ? bookings : bookings.filter((b) => b.status === filterStatus)

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Bookings Management</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
            <Plus className="w-4 h-4" />
            New Booking
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["All", "Confirmed", "Pending", "Cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-6 py-4 text-left text-sm font-semibold">Booking ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Event</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Tickets</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                    Loading bookings...
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{booking.id}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium">{booking.customerName}</p>
                        <p className="text-xs text-muted-foreground">{booking.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{booking.event}</td>
                    <td className="px-6 py-4 text-sm">{booking.tickets}</td>
                    <td className="px-6 py-4 text-sm font-medium">{booking.total.toFixed(2)} Tk</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === "Confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-muted rounded transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="p-2 hover:bg-red-100 hover:text-red-700 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
