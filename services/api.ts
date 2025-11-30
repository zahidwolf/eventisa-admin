// API Service Layer for FastAPI Backend Integration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://3.104.106.34";
export const API_TIMEOUT = Number.parseInt(
  process.env.NEXT_PUBLIC_API_TIMEOUT || "30000"
);

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

// Backend response format: {code: number, data: T, message: string}
interface BackendResponse<T> {
  code: number
  data: T
  message?: string
  error?: string
}

// Utility function for API calls with error handling
async function apiCall<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    let backendData: BackendResponse<T>
    try {
      backendData = await response.json()
    } catch (jsonError) {
      // If response is not JSON, try to get text
      const text = await response.text()
      throw new Error(`Invalid JSON response: ${text}`)
    }

    // Handle backend response format {code, data, message}
    if (backendData.code === 200) {
      // Handle both array and object data
      const data = backendData.data !== null && backendData.data !== undefined 
        ? backendData.data 
        : (Array.isArray(backendData) ? backendData : [])
      
      return {
        success: true,
        data: data as T,
        message: backendData.message || "Request successful",
      }
    } else {
      throw new Error(backendData.message || backendData.error || `API Error: ${response.statusText}`)
    }
  } catch (error) {
    clearTimeout(timeoutId)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error("[API Error]", endpoint, errorMessage)
    return {
      success: false,
      data: null as unknown as T,
      error: errorMessage,
    }
  }
}

// Bookings API (mapped to Participants)
export const bookingsApi = {
  getAll: () => apiCall<any[]>("/participant/all"),
  getById: (id: string) => apiCall<any>(`/participant/get_participants/user_id/${id}`),
  create: (data: unknown) => apiCall<any>("/participant/add", "POST", data),
  update: (id: string, data: unknown) => apiCall<any>(`/participant/update/${id}`, "PUT", data),
  delete: async (id: string) => {
    // Note: Backend doesn't have a delete endpoint for participants
    // Return error response
    return {
      success: false,
      data: null,
      error: "Delete functionality is not available for participants",
    }
  },
  getByStatus: (status: string) => apiCall<any[]>(`/participant/all`), // Filter client-side
  getByEventId: (eventId: string) => apiCall<any[]>(`/participant/get_participants/event_id/${eventId}`),
}

// Events API (mapped to actual backend endpoints)
export const eventsApi = {
  getAll: () => apiCall<any[]>("/event/all"),
  getById: (id: string) => apiCall<any>(`/event/search/${id}`),
  create: (data: unknown) => apiCall<any>("/event/add", "POST", data),
  update: (id: string, data: unknown) => apiCall<any>(`/event/update/${id}`, "PUT", data),
  delete: (id: string) => apiCall<any>(`/event/${id}`, "DELETE"),
  getStats: () => apiCall<any>("/event/all"), // Calculate stats from approved events
  getByHost: (hostId: string) => apiCall<any[]>(`/event/host/${hostId}`),
  getUpcoming: () => apiCall<any[]>("/event/upcoming/"),
  getArchived: () => apiCall<any[]>("/event/archive/"),
  getPending: () => apiCall<any[]>("/event/pending"),
  approve: (eventId: string) => apiCall<any>(`/event/approve/${eventId}`, "PUT"),
  reject: (eventId: string) => apiCall<any>(`/event/reject/${eventId}`, "PUT"),
}

// Financial API (mapped to participant analysis endpoints)
export const financialApi = {
  getSummary: () => apiCall<any>("/participant/analysis/daily_sale_total"),
  getRevenueTrend: (period: string) => {
    if (period === "daily") {
      return apiCall<any[]>("/participant/analysis/daily_sale_total")
    } else if (period === "monthly") {
      return apiCall<any[]>("/participant/analysis/total_monthly_sale")
    }
    return apiCall<any[]>("/participant/analysis/daily_sale_total")
  },
  getTransactions: () => apiCall<any[]>("/participant/all"),
  getExpenseBreakdown: () => apiCall<any>("/participant/analysis/daily_sale_total"),
  getTotalSaleByEvent: (eventId: string) => apiCall<any>(`/participant/analysis/total_sale_event/${eventId}`),
  getTotalSaleByCategory: (category: string) => apiCall<any>(`/participant/analysis/total_sale_category/${category}`),
}

// Invoices API (mapped to Participants - can generate invoices from participant data)
export const invoicesApi = {
  getAll: () => apiCall<any[]>("/participant/all"),
  getById: (id: string) => apiCall<any>(`/participant/get_participants/user_id/${id}`),
  create: (data: unknown) => apiCall<any>("/participant/add", "POST", data),
  update: (id: string, data: unknown) => apiCall<any>(`/participant/update/${id}`, "PUT", data),
  delete: (id: string) => apiCall<any>(`/participant/delete/${id}`, "DELETE"),
  getByStatus: (status: string) => apiCall<any[]>(`/participant/all`), // Filter client-side
  download: (id: string) => apiCall<Blob>(`/participant/get_participants/user_id/${id}`),
}

// Dashboard API (aggregated from events and participants)
export const dashboardApi = {
  getStats: async () => {
    const [events, participants] = await Promise.all([
      apiCall<any[]>("/event/all"),
      apiCall<any[]>("/participant/all"),
    ])
    
    if (events.success && participants.success) {
      const totalTickets = participants.data?.reduce((sum: number, p: any) => sum + (p.total_booked || 0), 0) || 0
      const totalRevenue = participants.data?.reduce((sum: number, p: any) => sum + (p.payment || 0), 0) || 0
      const activeEvents = events.data?.filter((e: any) => new Date(e.event_date) >= new Date()).length || 0
      
      return {
        success: true,
        data: {
          totalTickets,
          totalRevenue,
          activeEvents,
          totalBookings: participants.data?.length || 0,
        },
        message: "Stats retrieved successfully",
      }
    }
    return { success: false, data: null, error: "Failed to fetch stats" }
  },
  getRecentEvents: () => apiCall<any[]>("/event/upcoming/"),
  getChartData: () => apiCall<any[]>("/participant/analysis/daily_sale_total"),
}

// Calendar API (mapped to events)
export const calendarApi = {
  getEvents: (month?: number, year?: number) => {
    // Get all events and filter client-side for now
    return apiCall<any[]>("/event/all")
  },
  getEventDetails: (eventId: string) => apiCall<any>(`/event/search/${eventId}`),
}
