"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react"

export default function CallSimulationPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [conversation, setConversation] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [router])

  const startCall = () => {
    setIsCallActive(true)
    setConversation([
      { type: "bot", message: "Hello! I'm your AI assistant. How can I help you today?", timestamp: new Date() },
    ])
  }

  const endCall = () => {
    setIsCallActive(false)
    setIsRecording(false)
    setTranscript("")
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        processAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Could not access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }

  const processAudio = async (audioBlob) => {
    setIsProcessing(true)

    // Simulate speech-to-text processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockTranscripts = [
      "What are your business hours?",
      "How do I reset my password?",
      "Can you help me with billing questions?",
      "What services do you offer?",
      "How do I contact support?",
    ]

    const userMessage = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)]
    setTranscript(userMessage)

    // Add user message to conversation
    const newConversation = [...conversation, { type: "user", message: userMessage, timestamp: new Date() }]

    // Simulate bot response
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockResponses = [
      "Our business hours are Monday to Friday, 9 AM to 6 PM EST.",
      "To reset your password, please click on the 'Forgot Password' link on the login page.",
      "I can help you with billing questions. Please provide your account number.",
      "We offer AI-powered voice assistants, document processing, and customer support automation.",
      "You can contact our support team at support@genesys.com or through the chat widget.",
    ]

    const botResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]

    setConversation([...newConversation, { type: "bot", message: botResponse, timestamp: new Date() }])

    setIsProcessing(false)
    setTranscript("")
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Call Simulation</h1>
        <p className="text-gray-600">Test your voice assistant with real-time audio interaction</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Voice Interface
            </CardTitle>
            <CardDescription>Start a simulated call and interact with the AI assistant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              {!isCallActive ? (
                <Button onClick={startCall} size="lg" className="bg-green-600 hover:bg-green-700">
                  <Phone className="h-5 w-5 mr-2" />
                  Start Call
                </Button>
              ) : (
                <Button onClick={endCall} size="lg" variant="destructive">
                  <PhoneOff className="h-5 w-5 mr-2" />
                  End Call
                </Button>
              )}
            </div>

            {isCallActive && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {!isRecording ? (
                      <Button onClick={startRecording} size="lg" className="rounded-full h-16 w-16">
                        <Mic className="h-6 w-6" />
                      </Button>
                    ) : (
                      <Button
                        onClick={stopRecording}
                        size="lg"
                        variant="destructive"
                        className="rounded-full h-16 w-16 animate-pulse"
                      >
                        <MicOff className="h-6 w-6" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {isRecording ? "Recording... Click to stop" : "Click to start recording"}
                  </p>
                </div>

                {transcript && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Transcript:</p>
                    <p className="text-blue-800">{transcript}</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      Processing audio...
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Conversation History
            </CardTitle>
            <CardDescription>Real-time conversation between you and the AI assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversation.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Start a call to begin the conversation</p>
              ) : (
                conversation.map((message, index) => (
                  <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Simulation Settings</CardTitle>
          <CardDescription>Configure the voice assistant behavior and responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Response Tone</label>
              <select className="w-full p-2 border rounded-md">
                <option>Professional</option>
                <option>Friendly</option>
                <option>Casual</option>
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
              <label className="block text-sm font-medium mb-2">Voice Speed</label>
              <select className="w-full p-2 border rounded-md">
                <option>Normal</option>
                <option>Slow</option>
                <option>Fast</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
