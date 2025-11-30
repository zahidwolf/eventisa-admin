"use client"

import { useEffect, useState } from "react"
import { Check, X, Calendar, MapPin, Clock, DollarSign, Users, Image as ImageIcon, User, Mail, Phone } from "lucide-react"
import { format } from "date-fns"
import { eventsApi, API_BASE_URL } from "@/services/api"
import { useNotification } from "../notification-context"

interface PendingEvent {
  id: number
  event_title: string
  event_banner_img: string | null
  event_location: string
  event_description: string
  event_date: string
  event_time: string
  event_price: number
  total_seat: number
  event_category: string
  host_id: number
  host?: {
    name: string
    email: string
    phone_number: string
  }
  approval_status: string
}

export default function PendingEvents() {
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const { addNotification } = useNotification()

  useEffect(() => {
    fetchPendingEvents()
  }, [])

  const fetchPendingEvents = async () => {
    setLoading(true)
    try {
      const response = await eventsApi.getPending()
      if (response.success && Array.isArray(response.data)) {
        setPendingEvents(response.data)
      } else {
        addNotification("Failed to load pending events", "error")
      }
    } catch (error) {
      addNotification("Error loading pending events", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (eventId: number) => {
    setProcessingId(eventId)
    try {
      const response = await eventsApi.approve(String(eventId))
      if (response.success) {
        addNotification("Event approved successfully", "success")
        fetchPendingEvents()
      } else {
        addNotification(response.error || "Failed to approve event", "error")
      }
    } catch (error) {
      addNotification("Error approving event", "error")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (eventId: number) => {
    if (!confirm("Are you sure you want to reject this event?")) {
      return
    }
    setProcessingId(eventId)
    try {
      const response = await eventsApi.reject(String(eventId))
      if (response.success) {
        addNotification("Event rejected successfully", "success")
        fetchPendingEvents()
      } else {
        addNotification(response.error || "Failed to reject event", "error")
      }
    } catch (error) {
      addNotification("Error rejecting event", "error")
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pending Event Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve events submitted by hosts
          </p>
        </div>
        <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium">
          {pendingEvents.length} Pending
        </div>
      </div>

      {pendingEvents.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No pending event requests</p>
          <p className="text-muted-foreground text-sm mt-2">All events have been reviewed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingEvents.map((event) => (
            <div
              key={event.id}
              className="bg-card border border-border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Banner Image */}
              {event.event_banner_img ? (
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={`${API_BASE_URL}${event.event_banner_img}`}
                    alt={event.event_title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground" />
                </div>
              )}

              <div className="p-6">
                {/* Event Title and Category */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-xl font-bold line-clamp-2">{event.event_title}</h2>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium whitespace-nowrap ml-2">
                      Pending
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {event.event_category}
                    </span>
                  </div>
                </div>

                {/* Host Information */}
                {event.host && (
                  <div className="mb-4 p-4 bg-muted rounded-lg border border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Host Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-foreground">{event.host.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">{event.host.email}</span>
                      </div>
                      {event.host.phone_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">{event.host.phone_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Event Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{event.event_location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {format(new Date(event.event_date), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{event.event_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>{event.event_price} Tk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{event.total_seat} seats available</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {event.event_description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <button
                    onClick={() => handleApprove(event.id)}
                    disabled={processingId === event.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4" />
                    {processingId === event.id ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleReject(event.id)}
                    disabled={processingId === event.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    {processingId === event.id ? "Processing..." : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

