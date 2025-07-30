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
  const [uploadVisibility, setUploadVisibility] = useState(false)
  const [fetchingDocs, setFetchingDocs] = useState(false)
  const [fetchError, setFetchError] = useState(null)

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

    fetchDocuments()
  }, [router])

  const fetchDocuments = async () => {
    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {
      console.error("No access token found. Cannot fetch documents.")
      setFetchError("No access token found. Please log in again.")
      return
    }

    setFetchingDocs(true)
    setFetchError(null)

    try {
      console.log("Fetching documents from:", `${API_BASE_URL}/documents/`)

      const response = await fetch(`${API_BASE_URL}/documents/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to fetch documents.`)
      }

      const data = await response.json()
      console.log("Fetched documents data:", data)

      // Handle different possible response formats
      let documentsArray = []
      if (Array.isArray(data)) {
        documentsArray = data
      } else if (data.documents && Array.isArray(data.documents)) {
        documentsArray = data.documents
      } else if (data.data && Array.isArray(data.data)) {
        documentsArray = data.data
      } else {
        console.warn("Unexpected response format:", data)
        documentsArray = []
      }

      console.log("Processed documents array:", documentsArray)
      setDocuments(documentsArray)

    } catch (error) {
      console.error("Error fetching documents:", error)
      setFetchError(`Failed to load documents: ${error.message}`)
    } finally {
      setFetchingDocs(false)
    }
  }

  const handleUploadDocument = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {
      setUploadError("Not authenticated. Please log in.")
      setUploading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)

      console.log("Uploading document with visibility:", uploadVisibility)

      const response = await fetch(`${API_BASE_URL}/documents/upload?is_public=${uploadVisibility}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to upload document.")
      }

      const result = await response.json()
      console.log("Upload result:", result)

      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)

      // Refresh the documents list
      await fetchDocuments()

    } catch (error) {
      console.error("Error uploading document:", error)
      setUploadError(error.message || "An unexpected error occurred during upload.")
    } finally {
      setUploading(false)
      event.target.value = null
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    localStorage.removeItem("userRole")
    localStorage.removeItem("accessToken")
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
    <div className="max-w-6xl mx-auto p-6">
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

            {/* Documents List */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Your Documents</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchDocuments}
                  disabled={fetchingDocs}
                >
                  {fetchingDocs ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>

              {fetchError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <span className="text-sm">{fetchError}</span>
                </div>
              )}

              {fetchingDocs ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : documents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {fetchError ? "Unable to load documents." : "No documents uploaded yet."}
                </p>
              ) : (
                documents.map((doc, index) => {
                  // Use the actual document structure from your API
                  const documentId = doc.id || `doc-${index}`
                  const documentName = doc.filename || `Document ${index + 1}`
                  const isPublic = doc.is_public !== undefined ? doc.is_public : false
                  const uploadedAt = doc.uploaded // This matches your API response
                  const fileSize = doc.size
                  const fileType = doc.filetype
                  const status = doc.status

                  return (
                    <div key={documentId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{documentName}</span>
                          {fileType && (
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                              {fileType.toUpperCase()}
                            </span>
                          )}
                        </div>
                        {uploadedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded: {new Date(uploadedAt).toLocaleDateString()} •
                            {fileSize && ` ${(fileSize / 1024 / 1024).toFixed(2)} MB`}
                            {status && ` • ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${isPublic
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-700'
                          }`}>
                          {isPublic ? "Public" : "Private"}
                        </span>
                        <div title={isPublic ? "Public Document - Visible to all users" : "Private Document - Only visible to you"}>
                          {isPublic ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
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
            <Button variant="outline" className="w-full">
              View All Queries
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}