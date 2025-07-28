"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, MessageSquare, BarChart3, Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const API_BASE_URL = "http://172.17.180.124:8000"

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  // Document Management States
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [visibilityUpdating, setVisibilityUpdating] = useState(null) // Stores identifier of doc being updated

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    setUser({
      email: localStorage.getItem("userEmail"),
      name: localStorage.getItem("userName") || "User",
      role: localStorage.getItem("userRole") || "user",
    })

    fetchDocuments() // Fetch documents on component mount
  }, [router])

  const fetchDocuments = async () => {
    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {
      console.error("No access token found. Cannot fetch documents.")
      // Optionally redirect to login or show a message
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/documents/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to fetch documents.")
      }

      const data = await response.json()
      // Assuming data is an array of document objects like:
      // [{ identifier: "doc1", name: "Document 1.pdf", is_public: true, uploaded_at: "..." }]
      setDocuments(data)
    } catch (error) {
      console.error("Error fetching documents:", error)
      // You might want to set a state to display this error to the user
    }
  }

  const handleUploadDocument = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("is_public", "false") // Default to private on upload

    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {
      setUploadError("Not authenticated. Please log in.")
      setUploading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // "Content-Type": "multipart/form-data" is automatically set by browser for FormData
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to upload document.")
      }

      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000) // Hide success message after 3 seconds
      fetchDocuments() // Refresh the list of documents
    } catch (error) {
      console.error("Error uploading document:", error)
      setUploadError(error.message || "An unexpected error occurred during upload.")
    } finally {
      setUploading(false)
      // Clear file input after upload attempt
      event.target.value = null
    }
  }

  const handleToggleVisibility = async (identifier, currentVisibility) => {
    const newVisibility = !currentVisibility
    setVisibilityUpdating(identifier) // Set loading state for this specific document

    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {
      console.error("No access token found. Cannot update visibility.")
      setVisibilityUpdating(null)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/documents/${identifier}/visibility?is_public=${newVisibility}`, {
        method: "PUT", // Assuming PUT based on the API spec for updating visibility
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json", // Even if no body, good practice
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update document visibility.")
      }

      // Update the local state to reflect the change immediately
      setDocuments((prevDocs) =>
        prevDocs.map((doc) => (doc.identifier === identifier ? { ...doc, is_public: newVisibility } : doc)),
      )
    } catch (error) {
      console.error("Error updating visibility:", error)
      // You might want to display this error to the user
    } finally {
      setVisibilityUpdating(null) // Clear loading state
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}</p>
        </div>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              {documents.length > 0 ? `Last updated: ${new Date().toLocaleTimeString()}` : "No documents yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Query Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">+1.2% from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Document Management
            </CardTitle>
            <CardDescription>Upload and manage your knowledge base documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="document-upload" className="block w-full">
              <Button asChild className="w-full cursor-pointer">
                <span className="flex items-center justify-center">
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" /> Upload New Document
                    </>
                  )}
                </span>
              </Button>
            </Label>
            <Input
              id="document-upload"
              type="file"
              className="hidden"
              onChange={handleUploadDocument}
              disabled={uploading}
            />

            {uploadSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">Document uploaded successfully!</span>
              </div>
            )}
            {uploadError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">{uploadError}</span>
              </div>
            )}

            <div className="space-y-2">
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No documents uploaded yet.</p>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{doc.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{doc.is_public ? "Public" : "Private"}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleVisibility(doc.id, doc.is_public)}
                        disabled={visibilityUpdating === doc.id}
                        title={doc.is_public ? "Make Private" : "Make Public"}
                      >
                        {visibilityUpdating === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : doc.is_public ? (
                          <Eye className="h-4 w-4 text-blue-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Queries
            </CardTitle>
            <CardDescription>Latest user interactions and responses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium">{"How do I reset my password?"}</p>
                <p className="text-xs text-gray-500 mt-1">Answered successfully • 2 hours ago</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium">{"What are your business hours?"}</p>
                <p className="text-xs text-gray-500 mt-1">Answered successfully • 4 hours ago</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium">{"How to integrate the API?"}</p>
                <p className="text-xs text-gray-500 mt-1">Escalated to human • 6 hours ago</p>
              </div>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              View All Queries
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
