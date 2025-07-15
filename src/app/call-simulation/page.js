"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// SVG Icons for all controls
const PhoneIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const MicrophoneOnIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
)

const MicrophoneOffIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="1" y1="1" x2="23" y2="23"></line>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
)

const SpeakerOnIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
  </svg>
)

const SpeakerOffIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="1" y1="1" x2="23" y2="23"></line>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V6a3 3 0 0 0-5.94-.6"></path>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
    <path d="M12 19v4"></path>
    <path d="M8 23h8"></path>
  </svg>
)

const RecordingOnIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="12" r="8"></circle>
  </svg>
)

const RecordingOffIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
)

const EndCallIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
    <line x1="23" y1="1" x2="1" y2="23"></line>
  </svg>
)

export default function CallSimulationPage() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [isRecordingCall, setIsRecordingCall] = useState(false)
  const [conversation, setConversation] = useState([])
  const [callDuration, setCallDuration] = useState(0)
  const [callStatus, setCallStatus] = useState("Connecting...")
  const callIntervalRef = useRef(null)
  const conversationIntervalRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [router])

  // Effect for call duration timer
  useEffect(() => {
    if (isCallActive) {
      callIntervalRef.current = setInterval(() => {
        setCallDuration((prevDuration) => prevDuration + 1)
      }, 1000)
    } else {
      clearInterval(callIntervalRef.current)
      setCallDuration(0)
    }
    return () => clearInterval(callIntervalRef.current)
  }, [isCallActive])

  // Effect for automatic conversation flow
  useEffect(() => {
    if (isCallActive) {
      // Initial bot message
      setTimeout(() => {
        setCallStatus("Connected")
        setConversation([
          { type: "bot", message: "Hello! I'm your AI assistant. How can I help you today?", timestamp: new Date() },
        ])
      }, 2000)

      // Simulate ongoing conversation
      conversationIntervalRef.current = setInterval(() => {
        simulateConversationExchange()
      }, 8000) // New exchange every 8 seconds
    } else {
      clearInterval(conversationIntervalRef.current)
      setConversation([])
      setCallStatus("Call Ended")
    }
    return () => clearInterval(conversationIntervalRef.current)
  }, [isCallActive])

  const simulateConversationExchange = () => {
    const mockUserQuestions = [
      "What are your business hours?",
      "How do I reset my password?",
      "Can you help me with billing questions?",
      "What services do you offer?",
      "How do I contact support?",
      "Is there a mobile app available?",
      "What are your pricing plans?",
      "How do I cancel my subscription?",
    ]

    const mockBotResponses = [
      "Our business hours are Monday to Friday, 9 AM to 6 PM EST.",
      "To reset your password, please click on the 'Forgot Password' link on the login page.",
      "I can help you with billing questions. Please provide your account number.",
      "We offer AI-powered voice assistants, document processing, and customer support automation.",
      "You can contact our support team at support@genesys.com or through the chat widget.",
      "Yes, we have mobile apps available for both iOS and Android devices.",
      "We offer three pricing tiers: Basic ($29/month), Professional ($79/month), and Enterprise (custom pricing).",
      "You can cancel your subscription anytime from your account settings or by contacting support.",
    ]

    // Add user message
    const userMessage = mockUserQuestions[Math.floor(Math.random() * mockUserQuestions.length)]
    setConversation((prev) => [...prev, { type: "user", message: userMessage, timestamp: new Date() }])

    // Add bot response after delay
    setTimeout(() => {
      const botResponse = mockBotResponses[Math.floor(Math.random() * mockBotResponses.length)]
      setConversation((prev) => [...prev, { type: "bot", message: botResponse, timestamp: new Date() }])
    }, 2000)
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const startCall = () => {
    setIsCallActive(true)
    setCallStatus("Connecting...")
  }

  const endCall = () => {
    setIsCallActive(false)
    setIsMuted(false)
    setIsSpeakerOn(false)
    setIsRecordingCall(false)
    setCallStatus("Call Ended")
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn)
  }

  const toggleCallRecording = () => {
    setIsRecordingCall(!isRecordingCall)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Call Simulation</h1>
        <p className="text-gray-600">Experience a realistic voice call with AI assistant</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Call Interface */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-0">
              {!isCallActive ? (
                // Pre-call screen
                <div className="flex flex-col items-center justify-center h-96 space-y-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">AI</span>
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-900">AI Assistant</h2>
                    <p className="text-gray-600">Ready to help you</p>
                  </div>
                  <Button onClick={startCall} size="lg" className="bg-green-500 hover:bg-green-600 rounded-full px-8">
                    <PhoneIcon className="h-6 w-6 mr-2" />
                    Start Call
                  </Button>
                </div>
              ) : (
                // Active call screen
                <div className="flex flex-col h-96">
                  {/* Call Header (keep this the same) */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold">AI</span>
                    </div>
                    <h2 className="text-xl font-semibold">AI Assistant</h2>
                    <p className="text-blue-100">{callStatus}</p>
                    <p className="text-lg font-mono mt-2">{formatDuration(callDuration)}</p>
                    {isRecordingCall && (
                      <div className="flex items-center justify-center mt-2">
                        <div className="h-3 w-3 bg-red-400 rounded-full animate-pulse mr-2"></div>
                        <span className="text-sm text-red-200">Recording</span>
                      </div>
                    )}
                  </div>

                  {/* Call Controls with Emojis */}
                  <div className="flex-1 bg-gray-50 flex items-center justify-center">
                    <div className="grid grid-cols-4 gap-6">
                      {/* Mute Button */}
                      <Button
                        onClick={toggleMute}
                        size="lg"
                        className={cn(
                          "rounded-full h-16 w-16 text-2xl",
                          isMuted
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-white border border-gray-300 hover:bg-gray-100",
                        )}
                      >
                        {isMuted ? "🔇" : "🎤"}
                      </Button>

                      {/* Speaker Button */}
                      <Button
                        onClick={toggleSpeaker}
                        size="lg"
                        className={cn(
                          "rounded-full h-16 w-16 text-2xl",
                          isSpeakerOn
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-white border border-gray-300 hover:bg-gray-100",
                        )}
                      >
                        {isSpeakerOn ? "🔊" : "🔈"}
                      </Button>

                      {/* Record Button */}
                      <Button
                        onClick={toggleCallRecording}
                        size="lg"
                        className={cn(
                          "rounded-full h-16 w-16 text-2xl",
                          isRecordingCall
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-white border border-gray-300 hover:bg-gray-100",
                        )}
                      >
                        {isRecordingCall ? "⏺" : "⏸"}
                      </Button>

                      {/* End Call Button */}
                      <Button
                        onClick={endCall}
                        size="lg"
                        className="rounded-full h-16 w-16 bg-red-500 hover:bg-red-600 text-xl"
                      >
                        ✖
                      </Button>
                    </div>
                  </div>

                  {/* Call Status Bar (keep this the same) */}
                  <div className="bg-white border-t p-4 text-center text-sm text-gray-600">
                    <div className="flex justify-center items-center space-x-4">
                      {isMuted && <span className="text-red-600">🔇 Muted</span>}
                      {isSpeakerOn && <span className="text-blue-600">🔊 Speaker On</span>}
                      {isRecordingCall && <span className="text-red-600">⏺ Recording Call</span>}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Conversation History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SpeakerOnIcon className="h-5 w-5" />
              Live Transcript
            </CardTitle>
            <CardDescription>Real-time conversation transcript</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {conversation.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {isCallActive ? "Conversation will appear here..." : "Start a call to see the transcript"}
                </p>
              ) : (
                conversation.map((message, index) => (
                  <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${message.type === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                        }`}
                    >
                      <p>{message.message}</p>
                      <p className={`text-xs mt-1 ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Settings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Call Settings</CardTitle>
          <CardDescription>Configure your call experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Audio Quality</label>
              <select className="w-full p-2 border rounded-md">
                <option>HD Audio</option>
                <option>Standard</option>
                <option>Low Bandwidth</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select className="w-full p-2 border rounded-md">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Spanish</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Response Tone</label>
              <select className="w-full p-2 border rounded-md">
                <option>Professional</option>
                <option>Friendly</option>
                <option>Casual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Recording Format</label>
              <select className="w-full p-2 border rounded-md">
                <option>MP3</option>
                <option>WAV</option>
                <option>M4A</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}