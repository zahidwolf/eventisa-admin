# Eventisa Admin Dashboard - Backend Integration Guide

## Overview
This guide explains how to integrate the Next.js frontend with your FastAPI backend.

## Backend Requirements

Your FastAPI backend should provide these API endpoints:

### Bookings Endpoints
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/{id}` - Get specific booking
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Delete booking
- `GET /api/bookings/status/{status}` - Filter by status

### Events Endpoints
- `GET /api/events` - Get all events
- `GET /api/events/{id}` - Get specific event
- `POST /api/events` - Create event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event
- `GET /api/events/stats` - Get event statistics

### Financial Endpoints
- `GET /api/financial/summary` - Get financial summary
- `GET /api/financial/revenue-trend?period={period}` - Get revenue trends
- `GET /api/financial/transactions` - Get transactions
- `GET /api/financial/expenses` - Get expense breakdown

### Invoices Endpoints
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/{id}` - Get specific invoice
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/{id}` - Update invoice
- `DELETE /api/invoices/{id}` - Delete invoice
- `GET /api/invoices/status/{status}` - Filter by status
- `GET /api/invoices/{id}/download` - Download invoice

### Dashboard Endpoints
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-events` - Get recent events
- `GET /api/dashboard/chart-data` - Get chart data

### Calendar Endpoints
- `GET /api/calendar/events?month={month}&year={year}` - Get calendar events
- `GET /api/calendar/events/{id}` - Get event details

## Response Format

All endpoints should return JSON in this format:

\`\`\`json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
\`\`\`

Or for errors:

\`\`\`json
{
  "success": false,
  "error": "Error message",
  "data": null
}
\`\`\`

## Configuration

1. Update `.env.local`:
\`\`\`env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
\`\`\`

2. For production, update environment variables in your deployment platform.

## Database Models

Ensure your FastAPI backend has these models:

### Booking
- id (string)
- customerName (string)
- email (string)
- event (string)
- tickets (integer)
- total (float)
- status (enum: "Confirmed", "Pending", "Cancelled")
- date (datetime)

### Event
- id (string)
- name (string)
- date (datetime)
- venue (string)
- capacity (integer)
- sold (integer)
- status (enum: "Active", "Upcoming", "Completed")
- category (string)

### Invoice
- id (string)
- customerName (string)
- amount (float)
- issueDate (datetime)
- dueDate (datetime)
- status (enum: "Paid", "Pending", "Overdue")
- event (string)

## CORS Configuration

Enable CORS in your FastAPI backend:

\`\`\`python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "YOUR_PRODUCTION_URL"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
\`\`\`

## Testing

1. Start FastAPI backend:
\`\`\`bash
python main.py
\`\`\`

2. Start Next.js frontend:
\`\`\`bash
npm run dev
\`\`\`

3. Visit http://localhost:3000 and check the browser console for any API errors.

## Troubleshooting

- **CORS Error**: Ensure CORS is properly configured in your FastAPI backend
- **Connection Refused**: Check if backend is running on the correct port
- **Data Not Loading**: Check API response format matches expected structure
- **Timeout**: Increase `NEXT_PUBLIC_API_TIMEOUT` in `.env.local` if needed
\`\`\`
