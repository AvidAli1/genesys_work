"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Users,
  Building,
  Settings,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  KeyRound,
  RefreshCcw,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const API_BASE_URL = "http://172.17.180.124:8000" // Ensure this is consistent

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("tenants")
  const [user, setUser] = useState(null)
  const router = useRouter()

  // --- State for Tenants ---
  const [tenants, setTenants] = useState([
    { id: 1, name: "Acme Corp", users: 25, documents: 150, status: "Active" },
    { id: 2, name: "TechStart Inc", users: 12, documents: 89, status: "Active" },
    { id: 3, name: "Global Solutions", users: 45, documents: 320, status: "Inactive" },
  ])
  const [isAddTenantDialogOpen, setIsAddTenantDialogOpen] = useState(false)
  const [isEditTenantDialogOpen, setIsEditTenantDialogOpen] = useState(false)
  const [newTenantData, setNewTenantData] = useState({ name: "", status: "Active" })
  const [editingTenantData, setEditingTenantData] = useState(null)

  // --- State for Users ---
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john@acme.com", tenant: "Acme Corp", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane@techstart.com", tenant: "TechStart Inc", role: "User" },
    { id: 3, name: "Bob Wilson", email: "bob@global.com", tenant: "Global Solutions", role: "Manager" },
  ])
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [newUserData, setNewUserData] = useState({ name: "", email: "", tenant: "", role: "" })
  const [editingUserData, setEditingUserData] = useState(null)

  // Replace the existing billingPlans state with this:
  const [userUsageData, setUserUsageData] = useState([
    {
      id: 1,
      user: "john@acme.com",
      name: "John Doe",
      plan: "Pro",
      queryUsed: 342,
      queryLimit: 500,
      tokenUsed: 28500,
      tokenLimit: 50000,
      sttUsed: 1850,
      sttLimit: 3000,
      ttsUsed: 2100,
      ttsLimit: 3000,
      docsUsed: 23,
      docsLimit: 50,
      lastActive: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      user: "jane@techstart.com",
      name: "Jane Smith",
      plan: "Basic",
      queryUsed: 89,
      queryLimit: 100,
      tokenUsed: 7200,
      tokenLimit: 10000,
      sttUsed: 450,
      sttLimit: 600,
      ttsUsed: 380,
      ttsLimit: 600,
      docsUsed: 4,
      docsLimit: 5,
      lastActive: "2024-01-15T14:22:00Z",
    },
    {
      id: 3,
      user: "bob@global.com",
      name: "Bob Wilson",
      plan: "Enterprise",
      queryUsed: 1250,
      queryLimit: "Unlimited",
      tokenUsed: 125000,
      tokenLimit: 200000,
      sttUsed: 5500,
      sttLimit: 10000,
      ttsUsed: 6200,
      ttsLimit: 10000,
      docsUsed: 156,
      docsLimit: "Unlimited",
      lastActive: "2024-01-15T16:45:00Z",
    },
    {
      id: 4,
      user: "alice@startup.io",
      name: "Alice Johnson",
      plan: "Pro",
      queryUsed: 445,
      queryLimit: 500,
      tokenUsed: 41200,
      tokenLimit: 50000,
      sttUsed: 2650,
      sttLimit: 3000,
      ttsUsed: 2890,
      ttsLimit: 3000,
      docsUsed: 38,
      docsLimit: 50,
      lastActive: "2024-01-15T09:15:00Z",
    },
    {
      id: 5,
      user: "mike@company.com",
      name: "Mike Davis",
      plan: "Basic",
      queryUsed: 67,
      queryLimit: 100,
      tokenUsed: 5800,
      tokenLimit: 10000,
      sttUsed: 320,
      sttLimit: 600,
      ttsUsed: 290,
      ttsLimit: 600,
      docsUsed: 3,
      docsLimit: 5,
      lastActive: "2024-01-15T11:30:00Z",
    },
  ])

  // --- State for API Key ---
  const [apiKey, setApiKey] = useState(null)
  const [isApiKeyLoading, setIsApiKeyLoading] = useState(false)
  const [apiKeyError, setApiKeyError] = useState(null)

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (userRole !== "admin") {
      router.push("/dashboard")
      return
    }

    setUser({
      email: localStorage.getItem("userEmail"),
      name: localStorage.getItem("userName") || "Admin",
      role: userRole,
    })
  }, [router])

  // Effect to fetch API key when settings tab is active and user is admin
  useEffect(() => {
    const fetchApiKey = async () => {
      if (activeTab === "settings" && user?.role === "admin") {
        setIsApiKeyLoading(true)
        setApiKeyError(null)
        try {
          const accessToken = localStorage.getItem("accessToken")
          if (!accessToken) {
            setApiKeyError("No access token found. Please log in again.")
            setIsApiKeyLoading(false)
            return
          }

          const response = await fetch(`${API_BASE_URL}/auth/admin/join-code`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.detail || "Failed to fetch API key.")
          }

          const data = await response.json()
          setApiKey(data.join_code_hash) // Assuming the response is directly the string API key
        } catch (err) {
          console.error("Error fetching API key:", err)
          setApiKeyError(err.message || "An unexpected error occurred while fetching API key.")
        } finally {
          setIsApiKeyLoading(false)
        }
      }
    }

    fetchApiKey()
  }, [activeTab, user]) // Re-run when activeTab or user changes

  // --- User Management Functions ---
  const handleAddUser = (e) => {
    e.preventDefault()
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
      ...newUserData,
    }
    setUsers((prevUsers) => [...prevUsers, newUser])
    setNewUserData({ name: "", email: "", tenant: "", role: "" })
    setIsAddUserDialogOpen(false)
  }

  const handleEditUser = (e) => {
    e.preventDefault()
    setUsers((prevUsers) => prevUsers.map((user) => (user.id === editingUserData.id ? editingUserData : user)))
    setEditingUserData(null)
    setIsEditUserDialogOpen(false)
  }

  const handleDeleteUser = (id) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id))
  }

  // --- Tenant Management Functions ---
  const handleAddTenant = (e) => {
    e.preventDefault()
    const newTenant = {
      id: tenants.length > 0 ? Math.max(...tenants.map((t) => t.id)) + 1 : 1,
      users: 0, // Default new tenants to 0 users
      documents: 0, // Default new tenants to 0 documents
      ...newTenantData,
    }
    setTenants((prevTenants) => [...prevTenants, newTenant])
    setNewTenantData({ name: "", status: "Active" })
    setIsAddTenantDialogOpen(false)
  }

  const handleEditTenant = (e) => {
    e.preventDefault()
    setTenants((prevTenants) =>
      prevTenants.map((tenant) => (tenant.id === editingTenantData.id ? editingTenantData : tenant)),
    )
    setEditingTenantData(null)
    setIsEditTenantDialogOpen(false)
  }

  const handleDeleteTenant = (id) => {
    setTenants((prevTenants) => prevTenants.filter((tenant) => tenant.id !== id))
  }

  const tabs = [
    { id: "tenants", label: "Tenants", icon: Building },
    { id: "users", label: "Users", icon: Users },
    { id: "billing-plans", label: "Billing Plans", icon: DollarSign },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const renderTenants = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tenant Management</h2>
        <Dialog open={isAddTenantDialogOpen} onOpenChange={setIsAddTenantDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Tenant</DialogTitle>
              <DialogDescription>{"Enter the details for the new tenant."}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTenant} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tenant-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="tenant-name"
                  value={newTenantData.name}
                  onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tenant-status" className="text-right">
                  Status
                </Label>
                <select
                  id="tenant-status"
                  value={newTenantData.status}
                  onChange={(e) => setNewTenantData({ ...newTenantData, status: e.target.value })}
                  className="col-span-3 p-2 border rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <DialogFooter>
                <Button type="submit">Add Tenant</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{tenant.name}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>{tenant.users} users</span>
                    <span>{tenant.documents} documents</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        tenant.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog
                    open={isEditTenantDialogOpen && editingTenantData?.id === tenant.id}
                    onOpenChange={setIsEditTenantDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingTenantData(tenant)
                          setIsEditTenantDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Tenant</DialogTitle>
                        <DialogDescription>{"Update the details for this tenant."}</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleEditTenant} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-tenant-name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="edit-tenant-name"
                            value={editingTenantData?.name || ""}
                            onChange={(e) => setEditingTenantData({ ...editingTenantData, name: e.target.value })}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-tenant-status" className="text-right">
                            Status
                          </Label>
                          <select
                            id="edit-tenant-status"
                            value={editingTenantData?.status || "Active"}
                            onChange={(e) => setEditingTenantData({ ...editingTenantData, status: e.target.value })}
                            className="col-span-3 p-2 border rounded-md"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteTenant(tenant.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                {"Enter the details for the new user. Click save when you&apos;re done."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tenant" className="text-right">
                  Tenant
                </Label>
                <Input
                  id="tenant"
                  value={newUserData.tenant}
                  onChange={(e) => setNewUserData({ ...newUserData, tenant: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Input
                  id="role"
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">Add User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.tenant}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <Dialog
                          open={isEditUserDialogOpen && editingUserData?.id === user.id}
                          onOpenChange={setIsEditUserDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingUserData(user)
                                setIsEditUserDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                              <DialogDescription>{"Update the details for this user."}</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleEditUser} className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-user-name" className="text-right">
                                  Name
                                </Label>
                                <Input
                                  id="edit-user-name"
                                  value={editingUserData?.name || ""}
                                  onChange={(e) => setEditingUserData({ ...editingUserData, name: e.target.value })}
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-user-email" className="text-right">
                                  Email
                                </Label>
                                <Input
                                  id="edit-user-email"
                                  type="email"
                                  value={editingUserData?.email || ""}
                                  onChange={(e) => setEditingUserData({ ...editingUserData, email: e.target.value })}
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-user-tenant" className="text-right">
                                  Tenant
                                </Label>
                                <Input
                                  id="edit-user-tenant"
                                  value={editingUserData?.tenant || ""}
                                  onChange={(e) => setEditingUserData({ ...editingUserData, tenant: e.target.value })}
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-user-role" className="text-right">
                                  Role
                                </Label>
                                <Input
                                  id="edit-user-role"
                                  value={editingUserData?.role || ""}
                                  onChange={(e) => setEditingUserData({ ...editingUserData, role: e.target.value })}
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <DialogFooter>
                                <Button type="submit">Save Changes</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderBillingPlans = () => {
    const getUsagePercentage = (used, limit) => {
      if (limit === "Unlimited") return 0
      return Math.round((used / limit) * 100)
    }

    const getUsageColor = (percentage) => {
      if (percentage >= 90) return "text-red-600 bg-red-50"
      if (percentage >= 75) return "text-yellow-600 bg-yellow-50"
      return "text-green-600 bg-green-50"
    }

    const formatUsage = (used, limit) => {
      if (limit === "Unlimited") return `${used.toLocaleString()} / ∞`
      return `${used.toLocaleString()} / ${limit.toLocaleString()}`
    }

    const formatLastActive = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

      if (diffInHours < 1) return "Just now"
      if (diffInHours < 24) return `${diffInHours}h ago`
      return `${Math.floor(diffInHours / 24)}d ago`
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">User Usage Monitoring</h2>
          <div className="text-sm text-gray-500">Real-time usage tracking across all plans</div>
        </div>

        {/* Usage Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {userUsageData.filter((u) => u.plan === "Basic").length}
              </div>
              <p className="text-sm text-gray-600">Basic Plan Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {userUsageData.filter((u) => u.plan === "Pro").length}
              </div>
              <p className="text-sm text-gray-600">Pro Plan Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {userUsageData.filter((u) => u.plan === "Enterprise").length}
              </div>
              <p className="text-sm text-gray-600">Enterprise Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {
                  userUsageData.filter((u) => {
                    const queryPerc = getUsagePercentage(u.queryUsed, u.queryLimit)
                    const tokenPerc = getUsagePercentage(u.tokenUsed, u.tokenLimit)
                    return queryPerc >= 90 || tokenPerc >= 90
                  }).length
                }
              </div>
              <p className="text-sm text-gray-600">High Usage Alerts</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Queries (Daily)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tokens (Monthly)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT (s)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TTS (s)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userUsageData.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.user}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.plan === "Basic"
                              ? "bg-blue-100 text-blue-800"
                              : user.plan === "Pro"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatUsage(user.queryUsed, user.queryLimit)}</div>
                        {user.queryLimit !== "Unlimited" && (
                          <div
                            className={`text-xs px-2 py-1 rounded ${getUsageColor(getUsagePercentage(user.queryUsed, user.queryLimit))}`}
                          >
                            {getUsagePercentage(user.queryUsed, user.queryLimit)}% used
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatUsage(user.tokenUsed, user.tokenLimit)}</div>
                        {user.tokenLimit !== "Unlimited" && (
                          <div
                            className={`text-xs px-2 py-1 rounded ${getUsageColor(getUsagePercentage(user.tokenUsed, user.tokenLimit))}`}
                          >
                            {getUsagePercentage(user.tokenUsed, user.tokenLimit)}% used
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatUsage(user.sttUsed, user.sttLimit)}</div>
                        {user.sttLimit !== "Unlimited" && (
                          <div
                            className={`text-xs px-2 py-1 rounded ${getUsageColor(getUsagePercentage(user.sttUsed, user.sttLimit))}`}
                          >
                            {getUsagePercentage(user.sttUsed, user.sttLimit)}% used
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatUsage(user.ttsUsed, user.ttsLimit)}</div>
                        {user.ttsLimit !== "Unlimited" && (
                          <div
                            className={`text-xs px-2 py-1 rounded ${getUsageColor(getUsagePercentage(user.ttsUsed, user.ttsLimit))}`}
                          >
                            {getUsagePercentage(user.ttsUsed, user.ttsLimit)}% used
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatUsage(user.docsUsed, user.docsLimit)}</div>
                        {user.docsLimit !== "Unlimited" && (
                          <div
                            className={`text-xs px-2 py-1 rounded ${getUsageColor(getUsagePercentage(user.docsUsed, user.docsLimit))}`}
                          >
                            {getUsagePercentage(user.docsUsed, user.docsLimit)}% used
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatLastActive(user.lastActive)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Analytics</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">559</div>
            <p className="text-xs text-muted-foreground">+89 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Settings</h2>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure system-wide settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-2">System Name</Label>
              <Input defaultValue="Genesys Voicebot SaaS" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Default Language</Label>
              <select className="w-full p-2 border rounded-md">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Spanish</option>
              </select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Max File Upload Size (MB)</Label>
              <Input type="number" defaultValue="50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Configure security and authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Require 2FA for all admin users</p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-gray-600">Automatically log out inactive users</p>
              </div>
              <select className="p-2 border rounded-md">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* New API Key Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              API Key (Join Code)
            </CardTitle>
            <CardDescription>Retrieve the system-wide join code for new registrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isApiKeyLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="ml-3 text-gray-600">Loading API Key...</p>
              </div>
            ) : apiKeyError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <p className="text-sm">{apiKeyError}</p>
              </div>
            ) : apiKey ? (
              <div className="flex items-center space-x-2">
                <Input type="text" value={apiKey} readOnly className="flex-grow font-mono" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(apiKey)}
                  title="Copy API Key"
                >
                  Copy
                </Button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">API Key not available. Click refresh to fetch.</p>
            )}
            <Button
              onClick={() => {
                // Manually trigger fetchApiKey
                const fetchApiKey = async () => {
                  setIsApiKeyLoading(true)
                  setApiKeyError(null)
                  try {
                    const accessToken = localStorage.getItem("accessToken")
                    if (!accessToken) {
                      setApiKeyError("No access token found. Please log in again.")
                      setIsApiKeyLoading(false)
                      return
                    }

                    const response = await fetch(`${API_BASE_URL}/auth/admin/join-code`, {
                      method: "GET",
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: "application/json",
                      },
                    })

                    if (!response.ok) {
                      const errorData = await response.json()
                      throw new Error(errorData.detail || "Failed to fetch API key.")
                    }

                    const data = await response.json()
                    // Display the API key
                    console.log("Fetched API Key:", data)
                    setApiKey(data.join_code_hash)
                  } catch (err) {
                    console.error("Error fetching API key:", err)
                    setApiKeyError(err.message || "An unexpected error occurred while fetching API key.")
                  } finally {
                    setIsApiKeyLoading(false)
                  }
                }
                fetchApiKey()
              }}
              disabled={isApiKeyLoading}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh API Key
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage tenants, users, and system settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                        activeTab === tab.id ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          {activeTab === "tenants" && renderTenants()}
          {activeTab === "users" && renderUsers()}
          {activeTab === "billing-plans" && renderBillingPlans()}
          {activeTab === "analytics" && renderAnalytics()}
          {activeTab === "settings" && renderSettings()}
        </div>
      </div>
    </div>
  )
}
