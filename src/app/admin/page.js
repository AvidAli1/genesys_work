"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Building, Settings, BarChart3, Plus, Edit, Trash2, DollarSign } from "lucide-react"
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

  // --- State for Billing Plans ---
  const [billingPlans, setBillingPlans] = useState([
    {
      id: 1,
      name: "Basic",
      price_monthly: 29,
      description: "Perfect for small teams getting started",
      query_limit: "100/day",
      token_limit: "10,000/month",
      stt_seconds: "600",
      tts_seconds: "600",
      docs_limit: "5",
    },
    {
      id: 2,
      name: "Pro",
      price_monthly: 99,
      description: "For growing businesses with more needs",
      query_limit: "500/day",
      token_limit: "50,000/month",
      stt_seconds: "3,000",
      tts_seconds: "3,000",
      docs_limit: "50",
    },
    {
      id: 3,
      name: "Enterprise",
      price_monthly: 299,
      description: "For large organizations with custom needs",
      query_limit: "Unlimited",
      token_limit: "200,000/month",
      stt_seconds: "10,000",
      tts_seconds: "10,000",
      docs_limit: "Unlimited",
    },
  ])
  const [isAddPlanDialogOpen, setIsAddPlanDialogOpen] = useState(false)
  const [isEditPlanDialogOpen, setIsEditPlanDialogOpen] = useState(false)
  const [newPlanData, setNewPlanData] = useState({
    name: "",
    price_monthly: 0,
    description: "",
    query_limit: "",
    token_limit: "",
    stt_seconds: "",
    tts_seconds: "",
    docs_limit: "",
  })
  const [editingPlanData, setEditingPlanData] = useState(null)

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

  // --- Billing Plan Management Functions ---
  const handleAddPlan = (e) => {
    e.preventDefault()
    const newPlan = {
      id: billingPlans.length > 0 ? Math.max(...billingPlans.map((p) => p.id)) + 1 : 1,
      ...newPlanData,
      price_monthly: Number.parseFloat(newPlanData.price_monthly), // Ensure price is a number
    }
    setBillingPlans((prevPlans) => [...prevPlans, newPlan])
    setNewPlanData({
      name: "",
      price_monthly: 0,
      description: "",
      query_limit: "",
      token_limit: "",
      stt_seconds: "",
      tts_seconds: "",
      docs_limit: "",
    })
    setIsAddPlanDialogOpen(false)
  }

  const handleEditPlan = (e) => {
    e.preventDefault()
    setBillingPlans((prevPlans) =>
      prevPlans.map((plan) =>
        plan.id === editingPlanData.id
          ? { ...editingPlanData, price_monthly: Number.parseFloat(editingPlanData.price_monthly) }
          : plan,
      ),
    )
    setEditingPlanData(null)
    setIsEditPlanDialogOpen(false)
  }

  const handleDeletePlan = (id) => {
    setBillingPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== id))
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

  const renderBillingPlans = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Billing Plans Management</h2>
        <Dialog open={isAddPlanDialogOpen} onOpenChange={setIsAddPlanDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Billing Plan</DialogTitle>
              <DialogDescription>{"Enter the details for the new billing plan."}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPlan} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="plan-name"
                  value={newPlanData.name}
                  onChange={(e) => setNewPlanData({ ...newPlanData, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan-price" className="text-right">
                  Price/Month
                </Label>
                <Input
                  id="plan-price"
                  type="number"
                  value={newPlanData.price_monthly}
                  onChange={(e) => setNewPlanData({ ...newPlanData, price_monthly: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="plan-description"
                  value={newPlanData.description}
                  onChange={(e) => setNewPlanData({ ...newPlanData, description: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan-query-limit" className="text-right">
                  Query Limit
                </Label>
                <Input
                  id="plan-query-limit"
                  value={newPlanData.query_limit}
                  onChange={(e) => setNewPlanData({ ...newPlanData, query_limit: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan-token-limit" className="text-right">
                  Token Limit
                </Label>
                <Input
                  id="plan-token-limit"
                  value={newPlanData.token_limit}
                  onChange={(e) => setNewPlanData({ ...newPlanData, token_limit: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan-stt-seconds" className="text-right">
                  STT (s)
                </Label>
                <Input
                  id="plan-stt-seconds"
                  value={newPlanData.stt_seconds}
                  onChange={(e) => setNewPlanData({ ...newPlanData, stt_seconds: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan-tts-seconds" className="text-right">
                  TTS (s)
                </Label>
                <Input
                  id="plan-tts-seconds"
                  value={newPlanData.tts_seconds}
                  onChange={(e) => setNewPlanData({ ...newPlanData, tts_seconds: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan-docs-limit" className="text-right">
                  Docs Limit
                </Label>
                <Input
                  id="plan-docs-limit"
                  value={newPlanData.docs_limit}
                  onChange={(e) => setNewPlanData({ ...newPlanData, docs_limit: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">Add Plan</Button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Query Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT (s)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TTS (s)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Docs Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {billingPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${plan.price_monthly}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{plan.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.query_limit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.token_limit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.stt_seconds}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.tts_seconds}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.docs_limit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <Dialog
                          open={isEditPlanDialogOpen && editingPlanData?.id === plan.id}
                          onOpenChange={setIsEditPlanDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingPlanData(plan)
                                setIsEditPlanDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Edit Billing Plan</DialogTitle>
                              <DialogDescription>{"Update the details for this billing plan."}</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleEditPlan} className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-plan-name" className="text-right">
                                  Name
                                </Label>
                                <Input
                                  id="edit-plan-name"
                                  value={editingPlanData?.name || ""}
                                  onChange={(e) => setEditingPlanData({ ...editingPlanData, name: e.target.value })}
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-plan-price" className="text-right">
                                  Price/Month
                                </Label>
                                <Input
                                  id="edit-plan-price"
                                  type="number"
                                  value={editingPlanData?.price_monthly || 0}
                                  onChange={(e) =>
                                    setEditingPlanData({ ...editingPlanData, price_monthly: e.target.value })
                                  }
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-plan-description" className="text-right">
                                  Description
                                </Label>
                                <Input
                                  id="edit-plan-description"
                                  value={editingPlanData?.description || ""}
                                  onChange={(e) =>
                                    setEditingPlanData({ ...editingPlanData, description: e.target.value })
                                  }
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-plan-query-limit" className="text-right">
                                  Query Limit
                                </Label>
                                <Input
                                  id="edit-plan-query-limit"
                                  value={editingPlanData?.query_limit || ""}
                                  onChange={(e) =>
                                    setEditingPlanData({ ...editingPlanData, query_limit: e.target.value })
                                  }
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-plan-token-limit" className="text-right">
                                  Token Limit
                                </Label>
                                <Input
                                  id="edit-plan-token-limit"
                                  value={editingPlanData?.token_limit || ""}
                                  onChange={(e) =>
                                    setEditingPlanData({ ...editingPlanData, token_limit: e.target.value })
                                  }
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-plan-stt-seconds" className="text-right">
                                  STT (s)
                                </Label>
                                <Input
                                  id="edit-plan-stt-seconds"
                                  value={editingPlanData?.stt_seconds || ""}
                                  onChange={(e) =>
                                    setEditingPlanData({ ...editingPlanData, stt_seconds: e.target.value })
                                  }
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-plan-tts-seconds" className="text-right">
                                  TTS (s)
                                </Label>
                                <Input
                                  id="edit-plan-tts-seconds"
                                  value={editingPlanData?.tts_seconds || ""}
                                  onChange={(e) =>
                                    setEditingPlanData({ ...editingPlanData, tts_seconds: e.target.value })
                                  }
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-plan-docs-limit" className="text-right">
                                  Docs Limit
                                </Label>
                                <Input
                                  id="edit-plan-docs-limit"
                                  value={editingPlanData?.docs_limit || ""}
                                  onChange={(e) =>
                                    setEditingPlanData({ ...editingPlanData, docs_limit: e.target.value })
                                  }
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
                        <Button variant="outline" size="sm" onClick={() => handleDeletePlan(plan.id)}>
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
