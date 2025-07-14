import Link from "next/link"
import { Lock, BarChart, Phone, Settings } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen"> {/* Added flex layout */}
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Genesys Voicebot
            <span className="text-blue-600"> SaaS Platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Multi-tenant RAG-based voice assistant for enterprise solutions. Transform your customer interactions with
            AI-powered voice technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto">
                Get Started
              </button>
            </Link>
            <Link href="/signup">
              <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors w-full sm:w-auto">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>
      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Authentication Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication</h3>
            <p className="text-gray-600 mb-4">Secure user management and access control</p>
            <Link href="/auth">
              <button className="w-full bg-transparent border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                View Auth UI
              </button>
            </Link>
          </div>

          {/* Dashboard Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard</h3>
            <p className="text-gray-600 mb-4">Manage documents and view analytics</p>
            <Link href="/dashboard">
              <button className="w-full bg-transparent border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                Open Dashboard
              </button>
            </Link>
          </div>

          {/* Call Simulation Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Simulation</h3>
            <p className="text-gray-600 mb-4">Test voice interactions and responses</p>
            <Link href="/call-simulation">
              <button className="w-full bg-transparent border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                Start Simulation
              </button>
            </Link>
          </div>

          {/* Admin Panel Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Panel</h3>
            <p className="text-gray-600 mb-4">Tenant management and system administration</p>
            <Link href="/admin">
              <button className="w-full bg-transparent border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                Admin Panel
              </button>
            </Link>
          </div>
        </div>
      </div>
      {/* Footer - now sticks to bottom */}
      <footer className="bg-white border-t mt-auto"> {/* Added mt-auto */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Genesys Voicebot SaaS Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}