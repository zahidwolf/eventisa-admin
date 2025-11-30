"use client"

import { useEffect, useState } from "react"
import { Download, Eye, Trash2, Plus } from "lucide-react"
import { useNotification } from "../notification-context"
import { invoicesApi } from "@/services/api"

interface Invoice {
  id: string
  customerName: string
  amount: number
  issueDate: string
  dueDate: string
  status: "Paid" | "Pending" | "Overdue"
  event: string
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotification()

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true)
      const response = await invoicesApi.getAll()

      if (response.success && Array.isArray(response.data)) {
        setInvoices(response.data)
        addNotification("Invoices Loaded", "All invoices fetched successfully", "success")
      } else {
        console.error("Failed to fetch invoices:", response.error)
        addNotification("Error", response.error || "Failed to load invoices", "error")
      }
      setLoading(false)
    }

    fetchInvoices()
  }, [addNotification])

  const handleDownload = async (id: string) => {
    addNotification("Download Started", `Invoice ${id} is being downloaded`, "success")
  }

  const handleDelete = async (id: string) => {
    const response = await invoicesApi.delete(id)
    if (response.success) {
      setInvoices(invoices.filter((i) => i.id !== id))
      addNotification("Invoice Deleted", `Invoice ${id} has been removed`, "info")
    } else {
      addNotification("Error", response.error || "Failed to delete invoice", "error")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700"
      case "Pending":
        return "bg-blue-100 text-blue-700"
      case "Overdue":
        return "bg-red-100 text-red-700"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-6 py-4 text-left text-sm font-semibold">Invoice ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Event</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Issue Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-muted-foreground">
                    Loading invoices...
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{invoice.id}</td>
                    <td className="px-6 py-4 text-sm font-medium">{invoice.customerName}</td>
                    <td className="px-6 py-4 text-sm">{invoice.event}</td>
                    <td className="px-6 py-4 text-sm font-medium">${invoice.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">{invoice.issueDate}</td>
                    <td className="px-6 py-4 text-sm">{invoice.dueDate}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(invoice.id)}
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
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
