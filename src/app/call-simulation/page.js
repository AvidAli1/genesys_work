"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const API_BASE_URL = "http://172.17.180.124:8000"
const WS_BASE_URL = "ws://172.17.180.124:8000"

// SVG Icons for all controls
const PhoneIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const MicrophoneOnIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
)

const MicrophoneOffIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="1" y1="1" x2="23" y2="23"></line>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
)

const SpeakerOnIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
  </svg>
)

const SpeakerOffIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="1" y1="1" x2="23" y2="23"></line>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V6a3 3 0 0 0-5.94-.6"></path>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
    <path d="M12 19v4"></path>
    <path d="M8 23h8"></path>
  </svg>
)

const RecordingOnIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="8"></circle>
  </svg>
)

const RecordingOffIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
)

const EndCallIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
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
  // to turn RAG on/off
  const [ragEnabled, setRagEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState("Connecting...")
  const callIntervalRef = useRef(null)
  const conversationIntervalRef = useRef(null)
  const router = useRouter()

  // Debugging: message log
  const [messageLog, setMessageLog] = useState([]);
  const logMessage = (direction, message) => {
    setMessageLog(prev => [...prev, {
      timestamp: new Date().toISOString(),
      direction,
      message: JSON.stringify(message, null, 2)
    }].slice(-20)); // Keep last 20 messages
  };

  // New state for text chat
  const [textMessage, setTextMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState(null)

  // WebSocket state
  const [websocket, setWebsocket] = useState(null)
  const [wsConnected, setWsConnected] = useState(false)
  // Removed tenantId and userId state
  // Track last sent query_id for matching responses
  const [lastQueryId, setLastQueryId] = useState(null);

  // Reconnect attempts state
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [retryCount, setRetryCount] = useState(0)

  // useRef for ragEnabled
  const ragEnabledRef = useRef(ragEnabled);

  // update ragEnabled whenever it changes
  useEffect(() => {
    ragEnabledRef.current = ragEnabled;
  }, [ragEnabled]);

  // token state (read from localStorage)
  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken") || "";
    }
    return "";
  });

  // Ensure authentication and session ID are set before WebSocket connection
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const accessToken = localStorage.getItem("accessToken") || "";
    setToken(accessToken);
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    // Fetch user info and connect WebSocket using tenant_id and id directly
    async function fetchUserInfoAndConnect() {
      try {
        const resp = await fetch(`${API_BASE_URL}/auth/user`, {
          method: "GET",
          headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${accessToken}`
          }
        });
        if (!resp.ok) {
          throw new Error("Failed to fetch user info: " + resp.status);
        }
        const data = await resp.json();
        console.log("Fetched user info:", data);
        connectWebSocket(data.tenant_id, data.id);
      } catch (err) {
        console.error("❌ Error fetching user info:", err);
        // Optionally redirect to login or show error
      }
    }
    if (accessToken) {
      fetchUserInfoAndConnect();
    }
  }, [router]);

  // Change WebSocket useEffect to always maintain connection
  useEffect(() => {
    // WebSocket connection now handled after fetching user info
    return () => {
      if (websocket) {
        disconnectWebSocket();
      }
    };
  }, [token, sessionId]);

  // WebSocket connection now uses tenant_id and id directly
  const connectWebSocket = (tenantId, userId) => {
    try {
      const wsUrl = `${WS_BASE_URL}/ws/${tenantId}/${userId}`;
      console.log(`🔗 Connecting to ${wsUrl}`);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setWsConnected(true);
        setWebsocket(ws);
        setReconnectAttempts(0);
        ws.send(JSON.stringify({ type: "ping" }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 WebSocket Message:", data);

          if (data.type === "text_response") {
            console.log("✅ Got text response:", data.response);
          }

          if (typeof data === 'object' && data !== null && 'type' in data) {
            handleWebSocketMessage(data);
          } else {
            console.warn("⚠️ Received message without type:", data);
          }
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
          console.error("Raw message:", event.data);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setWsConnected(false);
      };

      ws.onclose = (event) => {
        console.log("🔌 WebSocket connection closed:", event.code, event.reason);
        setWsConnected(false);
        setWebsocket(null);

        if (reconnectAttempts < 3 && event.code !== 1000) {
          setTimeout(() => {
            console.log(`🔄 Attempting to reconnect... (${reconnectAttempts + 1}/3)`);
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket(tenantId, userId);
          }, 2000 * (reconnectAttempts + 1));
        }
      };

    } catch (error) {
      console.error("❌ Failed to create WebSocket connection:", error);
      setWsConnected(false);
    }
  };

  const disconnectWebSocket = () => {
    if (websocket) {
      // Stop continuous conversation mode
      const stopMessage = { type: "stop_continuous_conversation" }
      websocket.send(JSON.stringify(stopMessage))

      websocket.close()
      setWebsocket(null)
      setWsConnected(false)
    }
  }

  const handleWebSocketMessage = (data) => {
    const messageType = data.type || "unknown";
    console.log("🔍 Received WebSocket message:", messageType, data);

    // Print ragEnabled and data.rag for debugging
    console.log("[DEBUG] ragEnabled (current UI state):", ragEnabledRef.current); // thisIsRag
    if (typeof data.use_rag !== "undefined") {
      console.log("[DEBUG] data.use_rag (from backend):", data.use_rag); // thisIsRag
    }

    // Display all incoming responses regardless of query_id
    if (
      messageType === "query_result" ||
      messageType === "text_response" ||
      messageType === "query_with_tts_result"
    ) {
      // console.log("Incoming response ID:", data.query_id, "Last sent query ID:", lastQueryId);
      // if (!data.query_id || data.query_id !== lastQueryId) {
      //   console.warn("⚠️ Received response for a different query_id. Ignoring.");
      //   return;
      // }

      const responseText = data.response || data.message || "";
      console.log(`✅ Got matching response (${messageType}):`, responseText);

      // Clear timeout
      if (window.currentResponseTimeout) {
        clearTimeout(window.currentResponseTimeout);
        window.currentResponseTimeout = null;
      }

      const botMessage = {
        type: "bot",
        message: responseText,
        timestamp: new Date(),
        isText: true,
        queryId: data.query_id || "",
        rag: data.use_rag || false, // thisIsRag
      };
      setConversation((prev) => [...prev, botMessage]);
      setIsTyping(false);
      return;
    }

    // Handle all other message types
    switch (messageType) {
      case "session_id":
        console.log("🆔 Received session_id from backend:", data.session_id);
        break;

      case "ping":
        console.log("🏓 Ping received - sending pong");
        if (websocket) {
          websocket.send(JSON.stringify({ type: "pong" }));
        }
        break;

      case "speech_detected": {
        const transcript = data.transcript || "";
        const duration = data.duration || 0.0;
        if (transcript && transcript.trim().length > 2) {
          console.log(`🗣️ Speech detected (${duration.toFixed(1)}s): '${transcript}'`);
        }
        break;
      }

      case "transcription_result": {
        const transcriptResult = data.transcript || "";
        const confidence = data.confidence || 0.0;
        const processingTime = data.processing_time || 0.0;
        if (transcriptResult.trim()) {
          console.log(`📝 Transcription: ${transcriptResult} (${processingTime.toFixed(2)}s)`);
          const transcriptionMessage = {
            type: "user",
            message: transcriptResult,
            timestamp: new Date(),
            isText: false,
            rag: ragEnabledRef.current, // thisIsRag
          };
          setConversation((prev) => [...prev, transcriptionMessage]);
        }
        break;
      }

      case "health_check":
        console.log("🫀 Health check received");
        if (websocket) {
          websocket.send(JSON.stringify({ type: "health_check_ack" }));
        }
        break;

      case "query_with_tts_submitted":
        console.log("Query submitted:", data.query_id);
        console.log(`🔄 Processing query ${data.query_id ? data.query_id.substring(0, 8) : ''}...`);
        break;

      case "query_processing":
        console.log("Processing query:", data.query_id);
        break;

      case "tts_processing":
        console.log("Generating TTS for:", data.query_id);
        break;

      case "transcription_submitted":
        console.log(`📝 Transcribing at ${new Date().toLocaleTimeString()}`);
        break;

      case "tts_audio_chunk":
        console.log("🔊 TTS audio chunk received");
        break;

      case "continuous_conversation_started":
        console.log("✅ Continuous conversation mode started");
        break;

      case "continuous_conversation_stopped":
        console.log("🔄 Continuous conversation mode stopped");
        break;

      case "audio_status": {
        const status = data.status || "N/A";
        if (status === "ready") {
          console.log("🔊 TTS Ready");
        } else if (status === "generating") {
          console.log("🔄 TTS Generating...");
        } else if (status === "streaming") {
          console.log("🎵 TTS Streaming audio...");
        }
        break;
      }

      case "error": {
        const errorMsg = typeof data === "string" ? data : data.message || "Unknown error";
        console.error(`❌ WebSocket Error: ${errorMsg}`);
        if (window.currentResponseTimeout) {
          clearTimeout(window.currentResponseTimeout);
          window.currentResponseTimeout = null;
        }
        const errorMessage = {
          type: "bot",
          message: `Error: ${errorMsg}`,
          timestamp: new Date(),
          isText: true,
        };
        setConversation((prev) => [...prev, errorMessage]);
        setIsTyping(false);
        break;
      }

      case "pong":
        console.log("🏓 Pong received");
        break;

      default:
        console.warn("⚠️ Unhandled message type:", messageType, data);
        break;
    }
  }

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

  // Effect for initial bot message
  useEffect(() => {
    if (isCallActive) {
      setTimeout(() => {
        setCallStatus("Connected")
        setConversation([
          {
            type: "bot",
            message: "Hello! I'm your AI assistant. How can I help you today?",
            timestamp: new Date(),
            isText: false,
          },
        ])
      }, 2000)
    } else {
      clearInterval(conversationIntervalRef.current)
      setConversation([])
      setCallStatus("Call Ended")
    }
    return () => clearInterval(conversationIntervalRef.current)
  }, [isCallActive])

  // Updated submitTextQuery function with better error handling
  const submitTextQuery = async (query) => {
    if (!query.trim()) {
      console.error("❌ Query cannot be empty");
      return;
    }

    if (!token) {
      console.error("❌ No authentication token available");
      const errorMessage = {
        type: "bot",
        message: "Authentication error: Please log in again",
        timestamp: new Date(),
        isText: true,
      };
      setConversation((prev) => [...prev, errorMessage]);
      return;
    }

    // Add user message to conversation
    const userMessage = {
      type: "user",
      message: query,
      timestamp: new Date(),
      isText: true,
      rag: ragEnabledRef.current, // thisIsRag
    };
    setConversation((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Fetch user info for tenant_id and user_id before sending query
      const resp = await fetch(`${API_BASE_URL}/auth/user`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!resp.ok) {
        throw new Error("Failed to fetch user info: " + resp.status);
      }
      const userData = await resp.json();

      console.log("[DEBUG] ragEnabled sent to backend (1):", ragEnabledRef.current); // thisIsRag
      const payload = {
        tenant_id: userData.tenant_id,
        user_id: userData.id,
        query,
        use_rag: ragEnabledRef.current // thisIsRag
      };

      console.log("[DEBUG] Sending query payload:", payload);

      const response = await fetch(`${API_BASE_URL}/query/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          // Use default error message if can't parse response
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setLastQueryId(data.query_id);
      console.log("Sent query with ID:", data.query_id);

      window.currentResponseTimeout = setTimeout(() => {
        console.warn("⏰ No WebSocket response received within 30 seconds");
        setIsTyping(false);

        const timeoutMessage = {
          type: "bot",
          message: "Sorry, I didn't receive a response. Please try your message again.",
          timestamp: new Date(),
          isText: true,
        };
        setConversation((prev) => [...prev, timeoutMessage]);
        window.currentResponseTimeout = null;
      }, 30000);

    } catch (error) {
      console.error("❌ Error submitting query:", error);
      setIsTyping(false);

      const errorMessage = {
        type: "bot",
        message: `Error: ${error.message}`,
        timestamp: new Date(),
        isText: true,
      };
      setConversation((prev) => [...prev, errorMessage]);
    }
  };

  // Updated send message handler to use the new submitTextQuery function
  const handleSendTextMessage = async (e) => {
    e.preventDefault();
    if (!textMessage.trim() || isTyping) return;

    await submitTextQuery(textMessage.trim());
    setTextMessage("");
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Modify startCall to only send continuous conversation when needed
  const startCall = () => {
    setIsCallActive(true);
    setCallStatus("Connecting...");

    if (websocket) {
      console.log("[DEBUG] ragEnabled sent to backend (2):", ragEnabledRef.current); // thisIsRag
      const startMessage = {
        type: "start_continuous_conversation",
        tts_language: "en",
        voice: "en-US-JennyNeural",
        auto_respond: true,
        rag: ragEnabledRef.current // thisIsRag
      };
      websocket.send(JSON.stringify(startMessage));
    }
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
        {wsConnected && (
          <div className="mt-2 flex items-center text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            WebSocket Connected
          </div>
        )}
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
                  {/* Call Header */}
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
                          isMuted ? "bg-red-500 hover:bg-red-600" : "bg-white border border-gray-300 hover:bg-gray-100",
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

                  {/* Call Status Bar */}
                  <div className="bg-white border-t p-4 text-center text-sm text-gray-600">
                    <div className="flex justify-center items-center space-x-4">
                      {isMuted && <span className="text-red-600">🔇 Muted</span>}
                      {isSpeakerOn && <span className="text-blue-600">🔊 Speaker On</span>}
                      {isRecordingCall && <span className="text-red-600">⏺ Recording Call</span>}
                      {wsConnected && <span className="text-green-600">🔗 Connected</span>}
                      <span className={ragEnabledRef.current ? "text-green-600" : "text-gray-500"}>
                        RAG {ragEnabledRef.current ? "✓" : "✗"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Conversation History with Text Chat */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <SpeakerOnIcon className="h-5 w-5" />
              Live Transcript & Chat
            </CardTitle>
            <CardDescription>Real-time conversation transcript and text messaging</CardDescription>
            <div>
              <div className="flex flex-row items-center">
                <label className="block text-sm font-medium mb-2 mr-2">RAG Processing</label>
                <button
                  onClick={() => setRagEnabled(!ragEnabled)}
                  className={`relative inline-flex h-5 w-11 bottom-[1.5px] items-center rounded-full gap-2 ${ragEnabled ? "bg-blue-500" : "bg-gray-300"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${ragEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col h-96">
              {/* Chat Messages */}
              <div className="flex-1 space-y-1 overflow-y-auto p-4 bg-gray-50 rounded-t-lg">
                {conversation.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {isCallActive ? "Conversation will appear here..." : "Start a call or send a message to begin"}
                  </p>
                ) : (
                  conversation.map((message, index) => (
                    <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg text-sm ${message.type === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white text-gray-900 border rounded-bl-none shadow-sm"
                          }`}
                      >
                        <p>{message.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                          {message.isText && (
                            <span
                              className={`text-xs ml-2 ${message.type === "user" ? "text-blue-200" : "text-gray-400"}`}
                            >
                              💬
                            </span>
                          )}
                        </div>
                        {message.queryId && (
                          <p className="text-xs text-gray-400 mt-1">
                            Query ID: {message.queryId}
                            {/* Show RAG status based on message.rag value */}
                            {message.rag === true ? (
                              <span className="ml-2 text-green-500">RAG ✓</span>
                            ) : (
                              <span className="ml-2 text-gray-500">RAG ✗</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-900 border rounded-lg rounded-bl-none shadow-sm px-4 py-2 max-w-xs">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Input Area */}
              <div className="border-t bg-white p-4 rounded-b-lg">
                <form onSubmit={handleSendTextMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={textMessage}
                    onChange={(e) => setTextMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    disabled={!textMessage.trim() || isTyping}
                    className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isTyping ? "..." : "Send"}
                  </button>

                </form>
                {!wsConnected && (
                  <p className="text-xs text-red-500 mt-2 text-center">
                    WebSocket disconnected - Start a call to reconnect
                  </p>
                )}
              </div>
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
