"use client"

import { useEffect, useState } from "react"
import { Plus, Edit, Trash2, Download, Users, X, User, Mail, Calendar, Clock, FileText, DollarSign, Phone } from "lucide-react"
import { format } from "date-fns"
import { useNotification } from "../notification-context"
import { eventsApi, bookingsApi } from "@/services/api"
import CreateEventModal from "../create-event-modal"
import EditEventModal from "../edit-event-modal"
import jsPDF from "jspdf"
// @ts-ignore
import autoTable from "jspdf-autotable"

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY?: number
    }
    autoTable?: (options: any) => void
  }
}

interface Event {
  id: string
  name: string
  date: string
  venue: string
  capacity: number
  sold: number
  status: "Active" | "Upcoming" | "Completed"
  category: string
}

interface EventsProps {
  initialFilter?: string | null
}

export default function Events({ initialFilter }: EventsProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(initialFilter || null)
  const [viewParticipantsEventId, setViewParticipantsEventId] = useState<string | null>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [loadingParticipants, setLoadingParticipants] = useState(false)
  const { addNotification } = useNotification()

  const fetchEvents = async () => {
    setLoading(true)
    const [eventsResponse, participantsResponse] = await Promise.all([
      eventsApi.getAll(),
      bookingsApi.getAll(), // Fetch all participants to calculate ticket sales
    ])

    if (eventsResponse.success && Array.isArray(eventsResponse.data)) {
      const allParticipants = participantsResponse.success && Array.isArray(participantsResponse.data) 
        ? participantsResponse.data 
        : []
      
      // Transform backend event data to frontend format
      const transformedEvents: Event[] = eventsResponse.data
        .filter((event: any) => event != null)
        .map((event: any) => {
          try {
            // Calculate sold tickets from participants for this specific event
            const eventId = String(event.id || '')
            
            // Filter participants for this event - try different ways to match event_id
            const eventParticipants = allParticipants.filter((p: any) => {
              const pEventId = String(p.event_id || p.event?.id || '')
              return pEventId === eventId && pEventId !== '' && eventId !== ''
            })
            
            // Calculate sold tickets - sum of total_booked for all participants of this event
            const sold = eventParticipants.reduce((sum: number, p: any) => {
              const tickets = Number(p.total_booked) || 0
              return sum + tickets
            }, 0)
            
            const capacity = Number(event.total_seat) || 0
            
            
            // Determine status based on date
            // Active = events happening today or within the next 7 days
            // Upcoming = events happening after 7 days
            // Completed = events that have already passed
            let status: "Active" | "Upcoming" | "Completed" = "Upcoming"
            if (event.event_date) {
              const eventDate = new Date(event.event_date)
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              eventDate.setHours(0, 0, 0, 0)
              
              const daysDifference = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              
              if (daysDifference < 0) {
                status = "Completed"
              } else if (daysDifference >= 0 && daysDifference <= 7) {
                status = "Active"
              } else {
                status = "Upcoming"
              }
            }

            // Format date
            let formattedDate = "N/A"
            if (event.event_date) {
              try {
                formattedDate = new Date(event.event_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              } catch (e) {
                formattedDate = event.event_date
              }
            }

            return {
              id: String(event.id || 0),
              name: event.event_title || "Untitled Event",
              date: formattedDate,
              venue: event.event_location || "TBA",
              capacity: capacity,
              sold: sold,
              status: status,
              category: event.event_category || "General",
            }
          } catch (error) {
            console.error("Error transforming event:", event, error)
            return null
          }
        })
        .filter((event: Event | null) => event != null) as Event[]
      
      setEvents(transformedEvents)
      addNotification("Events Loaded", `Loaded ${transformedEvents.length} events`, "success")
    } else {
      console.error("Failed to fetch events:", eventsResponse.error, eventsResponse)
      addNotification("Error", eventsResponse.error || "Failed to load events", "error")
      setEvents([])
    }
    
    if (!participantsResponse.success) {
      console.error("Failed to fetch participants:", participantsResponse.error)
      addNotification("Warning", "Could not load participants data", "error")
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [addNotification])

  useEffect(() => {
    if (initialFilter) {
      setStatusFilter(initialFilter)
    }
  }, [initialFilter])

  const handleDelete = async (id: string) => {
    const response = await eventsApi.delete(id)
    if (response.success) {
      setEvents(events.filter((e) => e.id !== id))
      addNotification("Event Deleted", `Event has been removed`, "info")
    } else {
      addNotification("Error", response.error || "Failed to delete event", "error")
    }
  }

  const handleEdit = (event: Event) => {
    setSelectedEvent(event)
    setIsEditModalOpen(true)
  }

  const handleViewParticipants = async (eventId: string) => {
    setViewParticipantsEventId(eventId)
    setLoadingParticipants(true)
    try {
      // Fetch all participants from all events
      const allParticipantsResponse = await bookingsApi.getAll()
      
      if (allParticipantsResponse.success && Array.isArray(allParticipantsResponse.data)) {
        // If eventId is provided, filter by that event, otherwise show all
        const filteredParticipants = eventId 
          ? allParticipantsResponse.data.filter((p: any) => String(p.event_id) === String(eventId))
          : allParticipantsResponse.data
        
        setParticipants(filteredParticipants)
      } else {
        addNotification("Error", "Failed to load participants", "error")
        setParticipants([])
      }
    } catch (error) {
      console.error("Error fetching participants:", error)
      addNotification("Error", "Failed to load participants", "error")
      setParticipants([])
    } finally {
      setLoadingParticipants(false)
    }
  }

  const handleCloseParticipants = () => {
    setViewParticipantsEventId(null)
    setParticipants([])
  }

  const handleDownloadParticipantsPDF = () => {
    try {
      if (participants.length === 0) {
        addNotification("Error", "No participants to export", "error")
        return
      }

      const doc = new jsPDF()
      const eventName = viewParticipantsEventId 
        ? events.find(e => e.id === viewParticipantsEventId)?.name || "Event Participants"
        : "All Event Participants"
      
      // Title
      doc.setFontSize(18)
      doc.text(eventName, 14, 20)
      doc.setFontSize(12)
      doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 14, 28)
      
      // Prepare table data
      const tableData = participants.map((participant: any) => {
        const paymentDate = participant.payment_date 
          ? format(new Date(participant.payment_date), 'MMM dd, yyyy')
          : "Not paid"
        const paymentTime = participant.payment_time || ""
        const dateTime = paymentTime ? `${paymentDate} ${paymentTime}` : paymentDate
        
        return [
          `INV-${String(participant.id || 0).padStart(6, '0')}`,
          participant.user?.name || "Guest User",
          participant.user?.email || "N/A",
          participant.user?.phone_number || "N/A",
          String(participant.total_booked || 0),
          `${(participant.payment || 0).toFixed(2)} Tk`,
          dateTime,
        ]
      })
      
      // Generate table using autoTable
      // @ts-ignore
      autoTable(doc, {
        head: [["Invoice Number", "Name", "Email", "Phone Number", "Tickets", "Paid Amount", "Date"]],
        body: tableData,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [26, 26, 26], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 40 },
          2: { cellWidth: 50 },
          3: { cellWidth: 35 },
          4: { cellWidth: 20 },
          5: { cellWidth: 30 },
          6: { cellWidth: 40 },
        },
      })
      
      // Add summary at the bottom
      // @ts-ignore
      const finalY = doc.lastAutoTable?.finalY || 100
      doc.setFontSize(10)
      doc.text(`Total Participants: ${participants.length}`, 14, finalY + 10)
      doc.text(`Total Tickets: ${participants.reduce((sum: number, p: any) => sum + (p.total_booked || 0), 0)}`, 14, finalY + 16)
      doc.text(`Total Revenue: ${participants.reduce((sum: number, p: any) => sum + (p.payment || 0), 0).toFixed(2)} Tk`, 14, finalY + 22)
      
      // Save PDF
      const fileName = `${eventName.replace(/[^a-z0-9]/gi, '_')}_participants_${format(new Date(), 'yyyy-MM-dd')}.pdf`
      
      // Trigger download
      try {
        doc.save(fileName)
        addNotification("PDF Downloaded", "Participants table exported as PDF successfully", "success")
      } catch (saveError) {
        console.error("PDF save error:", saveError)
        // Fallback: create blob and download
        const pdfBlob = doc.output('blob')
        const url = URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        addNotification("PDF Downloaded", "Participants table exported as PDF successfully", "success")
      }
    } catch (error) {
      console.error("PDF generation error:", error)
      addNotification("Error", `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`, "error")
    }
  }

  const handleDownloadTicketData = async (eventId: string, eventName: string) => {
    try {
      const response = await bookingsApi.getByEventId(eventId)

      if (response.success && Array.isArray(response.data)) {
        // Transform participant data to CSV format
        const csvContent = [
          ["Invoice Number", "Customer Name", "Email", "Tickets", "Paid Amount", "Payment Date", "Status"],
          ...response.data.map((participant: any) => {
            const paymentDate = participant.payment_date 
              ? new Date(participant.payment_date).toLocaleDateString()
              : "N/A"
            const status = participant.payment > 0 ? "Paid" : "Pending"
            
            return [
              `INV-${String(participant.id || 0).padStart(6, '0')}`,
              participant.user?.name || "Guest User",
              participant.user?.email || "N/A",
              participant.total_booked || 0,
              `${participant.payment || 0} Tk`,
              paymentDate,
              status,
            ]
          }),
        ]
          .map((row) => row.map(cell => `"${cell}"`).join(","))
          .join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${eventName.replace(/[^a-z0-9]/gi, '_')}_participants_${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        addNotification("Download Complete", "Participant data exported successfully", "success")
      } else {
        addNotification("Error", "Failed to fetch participant data", "error")
      }
    } catch (error) {
      console.error("Download error:", error)
      addNotification("Error", "Failed to download participant data", "error")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700"
      case "Upcoming":
        return "bg-blue-100 text-blue-700"
      case "Completed":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Event Card Component
  const EventCard = ({ 
    event, 
    onDownload, 
    onEdit, 
    onDelete,
    onViewParticipants,
    getStatusColor 
  }: { 
    event: Event
    onDownload: (id: string, name: string) => void
    onEdit: (event: Event) => void
    onDelete: (id: string) => void
    onViewParticipants: (id: string) => void
    getStatusColor: (status: string) => string
  }) => (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{event.name}</h3>
          <p className="text-sm text-muted-foreground">{event.category}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
          {event.status}
        </span>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <p>
          <span className="text-muted-foreground">Date:</span> {event.date}
        </p>
        <p>
          <span className="text-muted-foreground">Venue:</span> {event.venue}
        </p>
        <p>
          <span className="text-muted-foreground">Capacity:</span> {event.capacity.toLocaleString()}
        </p>
      </div>

              <div className="mb-4">
                {/* Ticket Sales Information */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Tickets Sold</p>
                    <p className="text-lg font-bold text-green-400">
                      {(event.sold ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Tickets Remaining</p>
                    <p className="text-lg font-bold text-blue-400">
                      {Math.max(0, (event.capacity ?? 0) - (event.sold ?? 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => onViewParticipants(event.id)}
          className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 text-sm font-medium transition-colors"
        >
          <Users className="w-4 h-4" />
          View Participants
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onDownload(event.id, event.name)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-muted rounded hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={() => onEdit(event)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-border rounded hover:bg-muted text-sm font-medium transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="p-2 hover:bg-red-100 hover:text-red-700 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Events Management</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {/* Two Column Layout: Complete and Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complete Events Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Complete</h2>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {events.filter((e) => e.status === "Completed").length} events
            </span>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading events...</div>
            ) : events.filter((event) => event.status === "Completed").length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <p className="text-muted-foreground">No completed events</p>
              </div>
            ) : (
              events
                .filter((event) => event.status === "Completed")
                .map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onDownload={handleDownloadTicketData}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewParticipants={handleViewParticipants}
                    getStatusColor={getStatusColor}
                  />
                ))
            )}
          </div>
        </div>

        {/* Upcoming Events Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Upcoming</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {events.filter((e) => e.status === "Upcoming" || e.status === "Active").length} events
            </span>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading events...</div>
            ) : events.filter((event) => event.status === "Upcoming" || event.status === "Active").length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <p className="text-muted-foreground">No upcoming events</p>
              </div>
            ) : (
              events
                .filter((event) => event.status === "Upcoming" || event.status === "Active")
                .map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onDownload={handleDownloadTicketData}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewParticipants={handleViewParticipants}
                    getStatusColor={getStatusColor}
                  />
                ))
            )}
          </div>
        </div>
      </div>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={fetchEvents}
      />

      <EditEventModal
        isOpen={isEditModalOpen}
        event={selectedEvent}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedEvent(null)
        }}
        onEventUpdated={fetchEvents}
      />

      {/* Participants Modal - Matching Host Event Participants Design */}
      {viewParticipantsEventId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/80">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-1">
                  {viewParticipantsEventId ? "Event Participants" : "All Event Participants"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {viewParticipantsEventId 
                    ? events.find(e => e.id === viewParticipantsEventId)?.name || "Event Details"
                    : "Viewing all participants from all events"
                  }
                </p>
              </div>
              <div className="flex items-center gap-3">
                {participants.length > 0 && (
                  <button
                    onClick={handleDownloadParticipantsPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                )}
                <button
                  onClick={handleCloseParticipants}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-gradient-to-b from-black via-gray-900 to-black p-6">
              {loadingParticipants ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="text-6xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-xl">No participants registered yet</p>
                </div>
              ) : (
                <>
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl shadow-2xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Total Participants</p>
                          <p className="text-3xl font-bold text-primary-600">
                            {participants.reduce((sum: number, p: any) => sum + (p.total_booked || 0), 0)}
                          </p>
                        </div>
                        <Users className="text-4xl text-primary-200" />
                      </div>
                    </div>
                    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl shadow-2xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Total Bookings</p>
                          <p className="text-3xl font-bold text-secondary-600">{participants.length}</p>
                        </div>
                        <Calendar className="text-4xl text-secondary-200" />
                      </div>
                    </div>
                    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl shadow-2xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                          <p className="text-3xl font-bold text-green-600">
                            {participants.reduce((sum: number, p: any) => sum + (p.payment || 0), 0).toFixed(2)} Tk
                          </p>
                        </div>
                        <DollarSign className="text-4xl text-green-200" />
                      </div>
                    </div>
                  </div>

                  {/* Participants Table */}
                  <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-6 border-b border-gray-800">
                      <h2 className="text-2xl font-bold text-white">Participant Details</h2>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-800/50 border-b border-gray-700">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Invoice Number
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Event
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Tickets
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Paid Amount
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {participants.map((participant: any) => (
                            <tr key={participant.id} className="hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <FileText className="text-gray-400" />
                                    <span className="text-sm text-gray-300 font-mono">
                                      INV-{String(participant.id || 0).padStart(6, '0')}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-primary-600/20 rounded-full flex items-center justify-center mr-3">
                                      <User className="text-primary-400" />
                                    </div>
                                    <div className="text-sm font-medium text-white">
                                      {participant.user?.name || 'Guest User'}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <Mail className="text-gray-400" />
                                    <span className="text-sm text-gray-300">
                                      {participant.user?.email || 'N/A'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <Phone className="text-gray-400" />
                                    <span className="text-sm text-gray-300">
                                      {participant.user?.phone_number || 'N/A'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-white font-medium">
                                    {participant.total_booked || 0}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-green-400 font-medium">
                                    {participant.payment?.toFixed(2) || '0.00'} Tk
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {participant.payment_date ? (
                                    <div className="text-sm text-gray-300">
                                      <div className="flex items-center space-x-2">
                                        <Calendar className="text-gray-400" />
                                        <span>
                                          {format(new Date(participant.payment_date), 'MMM dd, yyyy')}
                                        </span>
                                      </div>
                                      {participant.payment_time && (
                                        <div className="flex items-center space-x-2 mt-1 ml-6">
                                          <Clock className="text-gray-400 text-xs" />
                                          <span className="text-xs text-gray-400">
                                            {participant.payment_time}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-500">Not paid</span>
                                  )}
                                </td>
                              </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
