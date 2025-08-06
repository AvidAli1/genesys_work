"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

const API_BASE_URL = "http://111.68.96.71:8000"

// Local IP: 172.17.180.124:8000
// Live IP: 111.68.96.71

export default function SignUpPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState("user") // Default to user role
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    confirmPassword: "",
    tenant_name: "",
    join_code: "",
    tenant_id: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value)
    // Reset form errors when changing roles
    setError(null)
  }

  const validateForm = () => {
    // Basic validation
    if (!formData.fname || !formData.lname || !formData.email || !formData.password) {
      setError("Please fill in all required fields")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    // Role-specific validation
    if (selectedRole === "organization" && (!formData.tenant_name || !formData.join_code)) {
      setError("Organization name and join code are required")
      return false
    }

    if (selectedRole === "user" && (!formData.tenant_id || !formData.join_code)) {
      setError("Tenant ID and join code are required")
      return false
    }

    if (selectedRole === "solo-user" && (!formData.tenant_name || !formData.join_code)) {
      setError("Tenant name and join code are required")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      let endpoint = ""
      let requestBody = {}

      // Prepare request based on selected role
      switch (selectedRole) {
        case "organization":
          endpoint = `${API_BASE_URL}/auth/register-org`
          requestBody = {
            tenant_name: formData.tenant_name,
            join_code: formData.join_code,
            fname: formData.fname,
            lname: formData.lname,
            email: formData.email,
            password: formData.password,
          }
          break

        case "user":
          endpoint = `${API_BASE_URL}/auth/register-user`
          requestBody = {
            tenant_id: formData.tenant_id,
            join_code: formData.join_code,
            fname: formData.fname,
            lname: formData.lname,
            email: formData.email,
            password: formData.password,
          }
          break

        case "solo-user":
          endpoint = `${API_BASE_URL}/auth/register-solo-user`
          requestBody = {
            fname: formData.fname,
            lname: formData.lname,
            email: formData.email,
            password: formData.password,
            tenant_name: formData.tenant_name,
            join_code: formData.join_code,
          }
          break

        default:
          setError("Invalid role selected")
          setIsLoading(false)
          return
      }

      // Make API request
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle API error
        if (data.detail) {
          // Format validation errors
          if (Array.isArray(data.detail)) {
            setError(data.detail.map((err) => `${err.msg} (${err.loc.join(".")})`).join(", "))
          } else {
            setError(data.detail)
          }
        } else {
          setError("Registration failed. Please try again.")
        }
        setIsLoading(false)
        return
      }

      // Clear authentication data from localStorage before redirecting to login
      // This ensures the navigation bar reflects a logged-out state.
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userName")
      localStorage.removeItem("userRole")
      localStorage.removeItem("accessToken")

      // Redirect to login page
      router.push("/login")
    } catch (err) {
      console.error("Registration error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Sign up for your new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <div className="grid grid-cols-3 gap-2">
                <div
                  className={`border rounded-md p-3 text-center cursor-pointer transition-colors ${
                    selectedRole === "organization" ? "bg-blue-100 border-blue-500 text-blue-700" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedRole("organization")}
                >
                  <input
                    type="radio"
                    id="role-org"
                    name="role"
                    value="organization"
                    checked={selectedRole === "organization"}
                    onChange={handleRoleChange}
                    className="sr-only"
                  />
                  <Label htmlFor="role-org" className="cursor-pointer">
                    Organization
                  </Label>
                </div>
                <div
                  className={`border rounded-md p-3 text-center cursor-pointer transition-colors ${
                    selectedRole === "user" ? "bg-blue-100 border-blue-500 text-blue-700" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedRole("user")}
                >
                  <input
                    type="radio"
                    id="role-user"
                    name="role"
                    value="user"
                    checked={selectedRole === "user"}
                    onChange={handleRoleChange}
                    className="sr-only"
                  />
                  <Label htmlFor="role-user" className="cursor-pointer">
                    User
                  </Label>
                </div>
                <div
                  className={`border rounded-md p-3 text-center cursor-pointer transition-colors ${
                    selectedRole === "solo-user" ? "bg-blue-100 border-blue-500 text-blue-700" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedRole("solo-user")}
                >
                  <input
                    type="radio"
                    id="role-solo"
                    name="role"
                    value="solo-user"
                    checked={selectedRole === "solo-user"}
                    onChange={handleRoleChange}
                    className="sr-only"
                  />
                  <Label htmlFor="role-solo" className="cursor-pointer">
                    Solo User
                  </Label>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fname" className="block text-sm font-medium mb-2">
                  First Name*
                </Label>
                <Input
                  id="fname"
                  name="fname"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.fname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lname" className="block text-sm font-medium mb-2">
                  Last Name*
                </Label>
                <Input
                  id="lname"
                  name="lname"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lname}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="block text-sm font-medium mb-2">
                Email*
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium mb-2">
                Password*
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password*
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Organization-specific fields */}
            {selectedRole === "organization" && (
              <>
                <div>
                  <Label htmlFor="tenant_name" className="block text-sm font-medium mb-2">
                    Organization Name*
                  </Label>
                  <Input
                    id="tenant_name"
                    name="tenant_name"
                    type="text"
                    placeholder="Enter organization name"
                    value={formData.tenant_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="join_code" className="block text-sm font-medium mb-2">
                    Join Code*
                  </Label>
                  <Input
                    id="join_code"
                    name="join_code"
                    type="text"
                    placeholder="Enter join code"
                    value={formData.join_code}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            {/* User-specific fields */}
            {selectedRole === "user" && (
              <>
                <div>
                  <Label htmlFor="tenant_id" className="block text-sm font-medium mb-2">
                    Tenant ID*
                  </Label>
                  <Input
                    id="tenant_id"
                    name="tenant_id"
                    type="text"
                    placeholder="Enter tenant ID"
                    value={formData.tenant_id}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="join_code" className="block text-sm font-medium mb-2">
                    Join Code*
                  </Label>
                  <Input
                    id="join_code"
                    name="join_code"
                    type="text"
                    placeholder="Enter join code"
                    value={formData.join_code}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            {/* Solo User-specific fields */}
            {selectedRole === "solo-user" && (
              <>
                <div>
                  <Label htmlFor="tenant_name" className="block text-sm font-medium mb-2">
                    Tenant Name*
                  </Label>
                  <Input
                    id="tenant_name"
                    name="tenant_name"
                    type="text"
                    placeholder="Enter tenant name"
                    value={formData.tenant_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="join_code" className="block text-sm font-medium mb-2">
                    Join Code*
                  </Label>
                  <Input
                    id="join_code"
                    name="join_code"
                    type="text"
                    placeholder="Enter join code"
                    value={formData.join_code}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
