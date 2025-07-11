"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, LogIn, UserPlus, LayoutDashboard, Phone, Settings, Shield } from "lucide-react"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const pathname = usePathname()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (isAuthenticated) {
      setUser({
        email: localStorage.getItem("userEmail"),
        name: localStorage.getItem("userName") || "User",
        role: localStorage.getItem("userRole") || "user",
      })
    } else {
      setUser(null)
    }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    localStorage.removeItem("userRole")
    setUser(null)
    window.location.href = "/login"
  }

  const navItems = [
    { href: "/", label: "Home", icon: Home, public: true },
    { href: "/login", label: "Login", icon: LogIn, public: true, hideWhenAuth: true },
    { href: "/signup", label: "Sign Up", icon: UserPlus, public: true, hideWhenAuth: true },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, protected: true },
    { href: "/call-simulation", label: "Call Simulation", icon: Phone, protected: true },
    { href: "/auth", label: "Auth UI", icon: Shield, protected: true },
    { href: "/admin", label: "Admin", icon: Settings, protected: true, adminOnly: true },
  ]

  const filteredNavItems = navItems.filter((item) => {
    if (item.hideWhenAuth && user) return false
    if (item.protected && !user) return false
    if (item.adminOnly && user?.role !== "admin") return false
    return true
  })

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Genesys</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {user && (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l">
                <span className="text-sm text-gray-600">
                  {user.name} ({user.role})
                </span>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              {user && (
                <div className="pt-4 border-t">
                  <div className="px-3 py-2 text-sm text-gray-600">
                    Logged in as {user.name} ({user.role})
                  </div>
                  <Button onClick={handleLogout} variant="outline" size="sm" className="mx-3 bg-transparent">
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
