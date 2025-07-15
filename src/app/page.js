import Link from "next/link"
import { Lock, BarChart, Phone, Settings, Check, Zap, Shield, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
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

      {/* Pricing Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your business needs. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Basic</h3>
                </div>
                <p className="text-gray-600 mb-6">Perfect for small teams getting started</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$29</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>100 queries/day</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>10,000 tokens/month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>5 documents storage</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Basic analytics</span>
                  </li>
                </ul>
                <Link href="/payments?plan=basic">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Subscribe
                  </button>
                </Link>
              </div>
            </div>

            {/* Pro Plan - Featured */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-blue-500 transform scale-105 hover:shadow-xl transition-all">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Pro</h3>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    Popular
                  </span>
                </div>
                <p className="text-gray-600 mb-6">For growing businesses with more needs</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>500 queries/day</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>50,000 tokens/month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>50 documents storage</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Link href="/payments?plan=pro">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Subscribe
                  </button>
                </Link>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Enterprise</h3>
                </div>
                <p className="text-gray-600 mb-6">For large organizations with custom needs</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$299</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Unlimited queries</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>200,000 tokens/month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Unlimited documents</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>24/7 dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Custom integrations</span>
                  </li>
                </ul>
                <Link href="/payments?plan=enterprise">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Subscribe
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Genesys Voicebot SaaS Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}