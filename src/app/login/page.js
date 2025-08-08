"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

const API_BASE_URL = "https://111.68.96.71:8443"

// Local IP: 172.17.180.124:8000
// Live IP: 111.68.96.71

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null) // Clear previous errors

    try {
      // Step 1: Attempt to log in
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const loginData = await loginResponse.json()

      if (!loginResponse.ok) {
        // Handle login API error
        if (loginData.detail) {
          if (Array.isArray(loginData.detail)) {
            setError(loginData.detail.map((err) => `${err.msg} (${err.loc.join(".")})`).join(", "))
          } else {
            setError(loginData.detail)
          }
        } else {
          setError("Login failed. Please check your credentials.")
        }
        return
      }

      // Successful login: Store access token
      const accessToken = loginData.access_token
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", email)
      localStorage.setItem("accessToken", accessToken)

      // Step 2: Call /auth/is_admin to check admin status
      const adminCheckResponse = await fetch(`${API_BASE_URL}/auth/is_admin`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`, // Pass the access token
          Accept: "application/json", // Ensure we accept JSON response
        },
      })

      let userRole = "user" // Default role
      if (adminCheckResponse.ok) {
        const adminData = await adminCheckResponse.json() // Assuming it returns an object like { is_admin: true }
        console.log("Admin check response:", adminData) // For debugging
        if (adminData && adminData.is_admin === true) {
          // Correctly check the 'is_admin' property
          userRole = "admin"
        }
      } else {
        console.warn("Failed to check admin status:", adminCheckResponse.status, adminCheckResponse.statusText)
        // Optionally handle specific errors for admin check, but for now, default to 'user'
      }

      localStorage.setItem("userRole", userRole)

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      console.error("Login process error:", err)
      setError("An unexpected error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {"Don't have an account?"}{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
