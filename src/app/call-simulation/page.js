"use client"

// Recorder.js - cross-browser PCM encoder
// https://github.com/mattdiamond/Recorderjs
// We'll use Recorder.js to get PCM Int16 from microphone
import Recorder from 'recorder-js';
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import AudioPlayer from './components/AudioPlayer';
const API_BASE_URL = "https://111.68.96.71:8443"
const WS_BASE_URL = "wss://111.68.96.71:8443"

// Local IP: 172.17.180.124:8000
// Live IP: 111.68.96.71

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

const VoiceMessage = ({ message, isUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const generateWaveform = () => {
    const bars = 40;
    return Array.from({ length: bars }, () => Math.random() * 100 + 10);
  };

  const [waveformData] = useState(generateWaveform());

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    setTimeout(() => setIsPlaying(false), parseFloat(message.duration) * 1000);
  };

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg min-w-[200px] max-w-[280px] ${isUser
      ? 'bg-blue-500 text-white'
      : 'bg-white border shadow-sm text-gray-900'
      }`}>
      <button
        onClick={togglePlayback}
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isUser
          ? 'bg-white/20 hover:bg-white/30 text-white'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
      >
        {isPlaying ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex items-center space-x-[1px] h-8">
        {waveformData.map((height, index) => (
          <div
            key={index}
            className={`w-[2px] rounded-full transition-all duration-150 ${isUser ? 'bg-white/70' : 'bg-blue-400'
              } ${isPlaying && index < 20 ? 'opacity-100' : 'opacity-60'}`}
            style={{ height: `${height * 0.25}px` }}
          />
        ))}
      </div>

      <span className={`text-xs font-mono flex-shrink-0 ${isUser ? 'text-white/80' : 'text-gray-500'
        }`}>
        {message.duration}s
      </span>
    </div>
  );
};

export default function CallSimulationPage() {
  const [isCallActive, setIsCallActive] = useState(false)
  const isCallActiveRef = useRef(isCallActive);
  const [isMuted, setIsMuted] = useState(false)
  const [isRecordingCall, setIsRecordingCall] = useState(false)
  const [conversation, setConversation] = useState([])
  const [callDuration, setCallDuration] = useState(0)
  // to turn RAG on/off
  const [ragEnabled, setRagEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState("Connecting...")
  const callIntervalRef = useRef(null)
  const conversationIntervalRef = useRef(null)
  const router = useRouter()

  // For sending voice messages
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const recordingIntervalRef = useRef(null)
  const [recordings, setRecordings] = useState({
    rawAudio: null,         // Before worker processing
    processedAudio: null,   // After worker processing (base64)
    finalAudio: null        // After WebSocket sending
  });

  // Audio recording state (new)
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recorderRef = useRef(null);

  // TTS audio playback state
  const [audioContext, setAudioContext] = useState(null);
  const [audioQueue, setAudioQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // At the top of your component
  const recorderWorkerRef = useRef(null);
  const audioDecoderWorkerRef = useRef(null);

  // New state for text chat
  const [textMessage, setTextMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // WebSocket state
  const [websocket, setWebsocket] = useState(null)
  const [wsConnected, setWsConnected] = useState(false)

  // Track last sent query_id for matching responses
  const [lastQueryId, setLastQueryId] = useState(null);

  // Reconnect attempts state
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [retryCount, setRetryCount] = useState(0)

  // for call simulation microphone
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])

  // useRef for ragEnabled
  const ragEnabledRef = useRef(ragEnabled);

  // useRef to keep track of ragEnabled state
  const recordingStreamRef = useRef(null);

  // New refs for continuous recording
  const continuousRecordingRef = useRef(null);
  const continuousWorkerRef = useRef(null);
  const callAudioQueueRef = useRef([]);
  const isCallAudioPlayingRef = useRef(false);
  const callAudioContextRef = useRef(null);
  const isMutedRef = useRef(isMuted);

  // For session_id and device_id
  const [sessionId, setSessionId] = useState(null)
  const [deviceId, setDeviceId] = useState(null);
  const sessionIdRef = useRef(null);
  const deviceIdRef = useRef(null);

  /* NEW */
  const isRecordingRef = useRef(false);
  // Update both state and ref
  const setRecordingState = (recording) => {
    isRecordingRef.current = recording;
    setIsRecording(recording);
  };
  /* NEW */

  useEffect(() => {
    sessionIdRef.current = sessionId;
    deviceIdRef.current = deviceId;
  }, [sessionId, deviceId]);

  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);

  // Add this useEffect
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Initialize audio context for call playback
  const initCallAudioContext = () => {
    if (!callAudioContextRef.current) {
      callAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return callAudioContextRef.current;
  };

  // Play call audio queue
  const playCallAudioQueue = () => {
    if (callAudioQueueRef.current.length === 0) {
      isCallAudioPlayingRef.current = false;
      return;
    }

    isCallAudioPlayingRef.current = true;
    const ctx = initCallAudioContext();
    const buffer = callAudioQueueRef.current.shift(); // Get and remove first item

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    source.onended = () => {
      // Play next in queue if available
      if (callAudioQueueRef.current.length > 0) {
        playCallAudioQueue();
      } else {
        isCallAudioPlayingRef.current = false;
      }
    };

    source.start(0);
  };

  // Handle call TTS audio
  const handleCallTTSChunk = async (base64Audio) => {
    try {
      const audioData = base64ToArrayBuffer(base64Audio);
      const ctx = initCallAudioContext();

      // Ensure audio context is resumed
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Decode the audio data
      ctx.decodeAudioData(audioData, (buffer) => {
        console.log("🎵 Adding audio buffer to call queue, length:", buffer.length);

        // Add to queue
        callAudioQueueRef.current.push(buffer);

        // Start playback if not already playing
        if (!isCallAudioPlayingRef.current) {
          console.log("▶️ Starting call audio playback");
          playCallAudioQueue();
        }
      }, (error) => {
        console.error("❌ Error decoding audio data:", error);
      });
    } catch (error) {
      console.error("❌ Error processing call audio:", error);
    }
  };

  // Start continuous recording
  const startContinuousRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(1024, 1, 1);

      // Create worker for continuous encoding
      const worker = new Worker('/StreamRecorderWorker.js');
      continuousWorkerRef.current = worker;

      worker.onmessage = (e) => {
        if (websocket && wsConnected && !isMutedRef.current) {
          websocket.send(JSON.stringify({
            type: "audio_chunk",
            audio: e.data,
            sample_rate: 16000,
            channels: 1,
            final: false,
            rag: ragEnabledRef.current,
            auto_respond: true,
            tts_language: "en",
            voice: "en-US-JennyNeural",
            chunk_id: crypto.randomUUID()
          }));
        }
      };

      processor.onaudioprocess = (event) => {
        const channelData = event.inputBuffer.getChannelData(0);
        worker.postMessage(channelData.slice(0));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      continuousRecordingRef.current = {
        stream,
        audioContext,
        source,
        processor
      };

      console.log("🎤 Continuous recording started");

    } catch (error) {
      console.error('Error starting continuous recording:', error);
    }
  };

  // Stop continuous recording
  const stopContinuousRecording = () => {
    const recording = continuousRecordingRef.current;
    if (recording) {
      recording.processor.disconnect();
      recording.source.disconnect();
      recording.audioContext.close();
      recording.stream.getTracks().forEach(track => track.stop());
      continuousRecordingRef.current = null;
    }

    if (continuousWorkerRef.current) {
      continuousWorkerRef.current.terminate();
      continuousWorkerRef.current = null;
    }

    if (websocket && wsConnected) {
      websocket.send(JSON.stringify({
        type: "continous_audio_stream",
        audio: '',
        sample_rate: 16000,
        channels: 1,
        final: true,
        rag: ragEnabledRef.current,
        auto_respond: true,
        tts_language: "en",
        voice: "en-US-JennyNeural",
        chunk_id: crypto.randomUUID()
      }));
    }
  };
  /* NEW */

  // Initialize audio context
  const initAudioContext = () => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
      return ctx;
    }
    return audioContext;
  };

  // Create worker once on mount
  useEffect(() => {
    recorderWorkerRef.current = new Worker('/RecorderWorker.js');
    return () => {
      if (recorderWorkerRef.current) {
        recorderWorkerRef.current.terminate();
      }
      if (audioDecoderWorkerRef.current) {
        audioDecoderWorkerRef.current.terminate();
      }
    };
  }, []);


  // Base64 to ArrayBuffer
  const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Play call audio


  // Play audio queue
  const playAudioQueue = async () => {
    if (audioQueue.length === 0 || isPlaying) return;
    setIsPlaying(true);
    const ctx = initAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = audioQueue[0];
    source.connect(ctx.destination);
    source.start(0);
    source.onended = () => {
      setAudioQueue(prev => prev.slice(1));
      setIsPlaying(false);
      if (audioQueue.length > 1) playAudioQueue();
    };
  };

  // Replace TTS chunk handler
  const handleTTSAudioChunk = (data) => {
    const ctx = initAudioContext();
    const audioData = base64ToArrayBuffer(data.audio);
    // Create Float32Array from PCM data
    const pcmData = new Int16Array(audioData);
    const float32Data = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      float32Data[i] = pcmData[i] / 32767.0;
    }
    // Create audio buffer directly
    const buffer = ctx.createBuffer(1, float32Data.length, 16000);
    buffer.copyToChannel(float32Data, 0);
    setAudioQueue(prev => [...prev, buffer]);
    if (!isPlaying) playAudioQueue();
  };

  // Debugging: message log
  const [messageLog, setMessageLog] = useState([]);
  const logMessage = (direction, message) => {
    setMessageLog(prev => [...prev, {
      timestamp: new Date().toISOString(),
      direction,
      message: JSON.stringify(message, null, 2)
    }].slice(-20)); // Keep last 20 messages
  };


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

  useEffect(() => {
    return () => {
      // Clean up any active recording
      if (isRecording) {
        stopVoiceRecording();
      }

      // Clean up worker
      if (recorderWorkerRef.current) {
        recorderWorkerRef.current.terminate();
      }

      // Clean up audio context
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  // Ensure authentication and session ID are set before WebSocket connection
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const accessToken = localStorage.getItem("accessToken") || "";
    setToken(accessToken);

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
  /* NEW */
  useEffect(() => {
    // Only handle cleanup on component unmount, not on dependency changes
    return () => {
      if (websocket) {
        console.log("🧹 Component unmounting - cleaning up WebSocket");
        disconnectWebSocket();
      }
    };
  }, []);
  /* NEW */

  // WebSocket connection now uses tenant_id and id directly
  const connectWebSocket = (tenantId, userId) => {

    console.log("🔗 Attempting WebSocket connection, current state:", {
      existingWS: !!websocket,
      existingState: websocket?.readyState,
      wsConnected
    });

    // If there's already a connection, close it first
    if (websocket && websocket.readyState !== WebSocket.CLOSED) {
      console.log("🔄 Closing existing WebSocket before creating new one");
      websocket.close();
    }

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

          /* NEW */
          console.log("[RAG DEBUG] Incoming message rag_used:", data.rag_used, "Full message:", data);
          /* NEW */

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
        console.log("Session ID:", sessionId, "Device ID:", deviceId);

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

  /* NEW */
  const disconnectWebSocket = () => {
    if (websocket && (websocket.readyState === WebSocket.OPEN || websocket.readyState === WebSocket.CONNECTING)) {
      console.log("🔌 Disconnecting WebSocket, current state:", websocket.readyState);

      // Stop continuous conversation mode if active
      if (websocket.readyState === WebSocket.OPEN) {
        try {
          const stopMessage = { type: "stop_continuous_conversation" };
          websocket.send(JSON.stringify(stopMessage));
        } catch (error) {
          console.warn("⚠️ Could not send stop message:", error);
        }
      }

      websocket.close(1000, "Disconnecting");
      setWebsocket(null);
      setWsConnected(false);
    } else {
      console.log("🔌 WebSocket is already in CLOSING or CLOSED state, skipping disconnect");
      // Still clean up state even if WebSocket is already closed
      setWebsocket(null);
      setWsConnected(false);
    }
  };
  /* NEW */

  const handleWebSocketMessage = (data) => {
    const messageType = data.type || "unknown";
    console.log("🔍 Received WebSocket message:", messageType, data);

    // Use ref value to avoid closure issues
    const currentCallActive = isCallActiveRef.current;

    // Handle audio streams immediately with current state
    if (messageType === "audio_stream") {
      if (currentCallActive) {
        console.log("🔊 [CALL] Playing audio stream instantly");
        handleCallTTSChunk(data.audio_data);
      } else {
        console.log("🔊 [VOICE MESSAGE] Adding audio chunk to conversation");
        const chunkIndex = parseInt(data.task_id.split('_').pop());
        const baseTaskId = data.task_id.substring(0, data.task_id.lastIndexOf('_'));

        setConversation(prev => {
          const existingIndex = prev.findIndex(
            msg => msg.taskId === baseTaskId && msg.type === 'audio_chunk'
          );

          if (existingIndex !== -1) {
            // Update existing entry with new chunk
            const updated = [...prev];
            const existingChunks = updated[existingIndex].chunks || [];
            updated[existingIndex] = {
              ...updated[existingIndex],
              chunks: [...existingChunks, { index: chunkIndex, base64: data.audio_data }]
            };
            return updated;
          } else {
            // Create new entry with first chunk
            return [
              ...prev,
              {
                type: 'audio_chunk',
                taskId: baseTaskId,
                chunks: [{ index: chunkIndex, base64: data.audio_data }],
                timestamp: new Date()
              }
            ];
          }
        });
      }
      return;
    }

    // Print ragEnabled and data.rag for debugging
    console.log("[DEBUG] ragEnabled (current UI state):", ragEnabledRef.current);
    if (typeof data.use_rag !== "undefined") {
      console.log("[DEBUG] data.use_rag (from backend):", data.use_rag);
    }

    // Display all incoming responses regardless of query_id
    if (
      messageType === "query_result" ||
      messageType === "text_response" ||
      messageType === "query_with_tts_result"
    ) {
      const responseText = data.response || data.message || "";
      console.log(`✅ Got matching response (${messageType}):`, responseText);

      // Clear timeout
      if (window.currentResponseTimeout) {
        clearTimeout(window.currentResponseTimeout);
        window.currentResponseTimeout = null;
      }

      // Skip chat updates during calls
      if (currentCallActive) {
        console.log("🧏 Skipping chat message rendering during call");
        return;
      }

      const botMessage = {
        type: "bot",
        message: responseText,
        timestamp: new Date(),
        isText: true,
        queryId: data.query_id || "",
        rag: data.rag_used || false,
      };
      /* NEW */
      console.log("[RAG DEBUG] Creating bot message with rag:", botMessage.rag);
      /* NEW */
      setConversation((prev) => [...prev, botMessage]);
      setIsTyping(false);
      return;
    }

    // Handle all other message types
    switch (messageType) {

      case "audio_chunk_processed":
        console.log("✅ Audio chunk processed:", data.chunk_id);
        break;

      case "session_info":
        console.log("🆔 Received session info:", data.session_id, data.device_id);
        setSessionId(data.session_id);
        setDeviceId(data.device_id);
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

        // Skip transcription UI updates during calls
        if (currentCallActive) {
          console.log("🧏 Skipping transcription UI update during call");
          return;
        }

        if (transcriptResult.trim()) {
          console.log(`📝 Transcription: ${transcriptResult} (${processingTime.toFixed(2)}s)`);
          const transcriptionMessage = {
            type: "user",
            message: transcriptResult,
            timestamp: new Date(),
            isText: false,
            isVoice: true,
            rag: ragEnabledRef.current,
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
        if (!isMuted) {
          handleTTSAudioChunk(data);
        }
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

        // Only show errors when not in call
        if (!currentCallActive) {
          const errorMessage = {
            type: "bot",
            message: `Error: ${errorMsg}`,
            timestamp: new Date(),
            isText: true,
          };
          setConversation((prev) => [...prev, errorMessage]);
          setIsTyping(false);
        }
        break;
      }

      case "pong":
        console.log("🏓 Pong received");
        break;

      default:
        console.warn("⚠️ Unhandled message type:", messageType, data);
        break;
    }
  };

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

  // Keyboard event listener for Space key recording
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger for 'P' key (case-insensitive), and not in input/textarea
      if (e.key.toLowerCase() !== 'p' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
      if (!isRecording && isCallActive) {
        startVoiceRecording();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() !== 'p') return;
      e.preventDefault();
      if (isRecording) {
        stopVoiceRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRecording, isCallActive]);

  // Recording duration timer
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(recordingIntervalRef.current)
      setRecordingDuration(0)
    }

    return () => clearInterval(recordingIntervalRef.current)
  }, [isRecording])

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
      rag: ragEnabledRef.current,
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
      console.log("User data fetched:", userData);

      console.log("Current sessionId:", sessionId);
      console.log("Current deviceId:", deviceId);
      // Prepare payload with session and device info
      const payload = {
        query: query.trim(),
        session_id: sessionId,
        device_id: deviceId,
        use_rag: ragEnabledRef.current,
        fallback_on_error: true,
        max_tokens: 1012,
        temperature: 0.7,
        tenant_id: userData.tenant_id,
        user_id: userData.id,
      };

      console.log("[DEBUG] Query payload with session info:", payload);

      const response = await fetch(`${API_BASE_URL}/query/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("[DEBUG] Raw response body:", responseText);

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.detail) {
            if (Array.isArray(errorData.detail)) {
              errorMsg = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
            } else {
              errorMsg = errorData.detail;
            }
          } else {
            errorMsg = errorData.message || errorMsg;
          }
        } catch (e) {
          console.warn("[DEBUG] Could not parse error response as JSON");
        }
        throw new Error(errorMsg);
      }

      const data = JSON.parse(responseText);
      console.log("[DEBUG] Parsed success response:", data);

      setLastQueryId(data.query_id);
      console.log("✅ Query submitted successfully with ID:", data.query_id);

      // Set timeout for WebSocket response
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

  const startVoiceRecording = async () => {
    if (isRecordingRef.current) return;
    if (isRecording) return;
    if (!websocket || !wsConnected) {
      console.error("❌ WebSocket not connected");
      return;
    }
    /* NEW  */
    const audioContext = new AudioContext();
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    /* NEW */
    try {
      // 1. Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;

      // 2. Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      audioContextRef.current = audioContext;

      // 3. Initialize recorder
      const recorder = new Recorder(audioContext);
      await recorder.init(stream);
      recorder.start();
      /* NEW */
      setRecordingState(true);
      /* NEW */
      recorderRef.current = recorder;

      // 4. ONLY NOW set recording to true (after everything has initialized)
      setTimeout(async () => {
        setIsRecording(true);
        console.log("🎤 Voice recording started");
      }); // small delay to recording actually start

    } catch (error) {
      /* NEW */
      setRecordingState(false);
      /* NEW */
      console.error('❌ Error starting voice recording:', error);
      cleanupRecordingResources();
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopVoiceRecording = async () => {
    /* NEW */
    if (!isRecordingRef.current) return;
    /* NEW */
    if (!isRecording || !recorderRef.current) return;

    try {
      // 1. Stop the recorder and get audio buffer
      const { buffer } = await recorderRef.current.stop();

      // Save raw audio buffer before processing
      const rawAudioBlob = new Blob([buffer[0]], { type: 'audio/wav' });
      const rawAudioUrl = URL.createObjectURL(rawAudioBlob);
      setRecordings(prev => ({
        ...prev,
        rawAudio: {
          url: rawAudioUrl,
          blob: rawAudioBlob,
          timestamp: new Date().toISOString()
        }
      }));
      console.log('Saved raw audio:', rawAudioUrl);

      if (buffer && buffer[0]) {
        // 2. Process audio through worker
        const float32Array = buffer[0];
        const worker = new Worker('/RecorderWorker.js');

        await new Promise((resolve) => {
          worker.onmessage = (e) => {
            // Save the base64 audio received from worker
            setRecordings(prev => ({
              ...prev,
              processedAudio: {
                base64: e.data,
                timestamp: new Date().toISOString()
              },
              finalAudio: {
                base64: e.data,
                timestamp: new Date().toISOString()
              }
            }));
            console.log('Saved processed base64 audio (first 30 chars):', e.data.substring(0, 30));

            // 3. Send audio to server via WebSocket /* NEW */
            if (websocket && wsConnected && websocket?.readyState === WebSocket.OPEN) {
              websocket.send(JSON.stringify({
                /* NEW */
                type: "audio_chunk",
                audio: e.data,
                sample_rate: 16000,
                channels: 1,
                final: true,
                duration: float32Array.length / 16000,
                rag: ragEnabledRef.current,
                auto_respond: true,
                tts_language: "en",
                voice: "en-US-JennyNeural",
                chunk_id: crypto.randomUUID() // Generate unique ID for this chunk
                /* NEW */
              }));

              // 4. Add user voice message immediately to show it was sent
              const userVoiceMessage = {
                type: "user",
                message: "",
                timestamp: new Date(),
                isText: false,
                isVoice: true,
                duration: (float32Array.length / 16000).toFixed(1),
                rag: ragEnabledRef.current,
              };
              setConversation((prev) => [...prev, userVoiceMessage]);
            }
            if (e.data === 'done') {
              worker.terminate();
              return;
            }
            resolve();
          };
          worker.postMessage(float32Array);
        });
      }

    } catch (error) {
      console.error('❌ Error stopping recording:', error);
    } finally {
      cleanupRecordingResources();
      setRecordingState(false);
      setIsRecording(false);
      setRecordingDuration(0);
      console.log("🛑 Voice recording stopped");
      console.log("Final recordings state:", recordings);
    }
  };

  const cleanupRecordingResources = () => {
    // 1. Stop recorder if active
    if (recorderRef.current) {
      recorderRef.current.stop().catch(e => console.warn("Recorder stop error:", e));
      recorderRef.current = null;
    }

    // 2. Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(e => console.warn("AudioContext close error:", e));
      audioContextRef.current = null;
    }

    // 3. Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopVoiceRecording();
      }
      cleanupRecordingResources();
    };
  }, []);

  const formatRecordingDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // to start recording from microphone 
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `call-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }

      setAudioChunks(chunks)
      setMediaRecorder(recorder)
      recorder.start()
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  // to stop recording from microphone
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      setMediaRecorder(null)
      setAudioChunks([])
    }
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

      /* NEW */
      // Start continuous recording
      startContinuousRecording();
      /* NEW */
    }
  }

  /* NEW */
  const endCall = () => {
    console.log("📞 Ending call...");

    // Stop continuous recording first
    stopContinuousRecording();

    // Update UI state
    setIsCallActive(false);
    setIsMuted(false);
    setIsRecordingCall(false);
    setCallStatus("Call Ended");

    // Clear call audio queue and context
    callAudioQueueRef.current = [];
    isCallAudioPlayingRef.current = false;
    if (callAudioContextRef.current) {
      callAudioContextRef.current.close();
      callAudioContextRef.current = null;
    }

    // Handle WebSocket disconnection more gracefully
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      // Send stop message to backend
      try {
        const stopMessage = { type: "stop_continuous_conversation" };
        websocket.send(JSON.stringify(stopMessage));
      } catch (error) {
        console.warn("⚠️ Could not send stop message:", error);
      }

      // Close the WebSocket connection
      websocket.close(1000, "Call ended");
    }

    // Clean up WebSocket state immediately
    setWebsocket(null);
    setWsConnected(false);

    // Reset reconnection attempts for fresh start
    setReconnectAttempts(0);

    // Reconnect after ensuring clean disconnection
    setTimeout(() => {
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      const accessToken = localStorage.getItem("accessToken") || "";

      if (!isAuthenticated || !accessToken) {
        console.warn("⚠️ Not authenticated, redirecting to login");
        router.push("/login");
        return;
      }

      console.log("🔄 Reconnecting WebSocket after call end...");

      // Fetch fresh user info and reconnect
      fetch(`${API_BASE_URL}/auth/user`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${accessToken}`
        }
      })
        .then(resp => {
          if (!resp.ok) {
            throw new Error(`Failed to fetch user info: ${resp.status}`);
          }
          return resp.json();
        })
        .then(data => {
          console.log("🔄 Reconnecting with fresh user data:", data);
          // Connect with fresh tenant_id and user_id
          connectWebSocket(data.tenant_id, data.id);
        })
        .catch(err => {
          console.error("❌ Error reconnecting WebSocket after call:", err);
          if (err.message.includes('401') || err.message.includes('403')) {
            router.push("/login");
          }
        });
    }, 1500); // Slightly longer delay to ensure clean state
  };
  /* NEW */

  const toggleMute = () => {
    setIsMuted(!isMuted)
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

                      {/* Audio Status - Always shows audio is active during call */}
                      <div className="rounded-full h-16 w-16 bg-green-100 border-2 border-green-400 flex items-center justify-center text-2xl relative">
                        🔊
                        {isCallActive && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>

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
                      <span className="text-green-600">🔊 Audio Active</span>
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
            {/* NEW */}
            {!isCallActive && (
              /* NEW */
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
                        {message.isVoice ? (
                          <VoiceMessage message={message} isUser={message.type === "user"} />
                        ) : (
                          <div className={`max-w-xs px-4 py-2 rounded-lg text-sm ${message.type === "user"
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
                            {message.isVoice && (
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-blue-200">🎤</span>
                                <span className="text-xs text-blue-200">
                                  Voice • {message.duration}s
                                </span>
                              </div>
                            )}
                            {message.queryId && (
                              <p className="text-xs text-gray-400 mt-1">
                                Query ID: {message.queryId}
                                {message.rag === true ? (
                                  <span className="ml-2 text-green-500">RAG ✓</span>
                                ) : (
                                  <span className="ml-2 text-gray-500">RAG ✗</span>
                                )}
                              </p>
                            )}
                            {message.type === 'audio_chunk' && (
                              <AudioPlayer
                                chunks={message.chunks}
                                taskId={message.taskId}
                              />
                            )}
                          </div>
                        )}
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
                  {isRecording ? (
                    // Recording UI (unchanged)
                    <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border-2 border-red-200">
                      {/* ... existing recording UI ... */}
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-600 font-medium">Recording...</span>
                      </div>
                      <div className="flex-1 text-center">
                        <span className="text-lg font-mono text-red-600">
                          {formatRecordingDuration(recordingDuration)}
                        </span>
                      </div>
                      <button
                        onClick={stopVoiceRecording}
                        className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        Stop
                      </button>
                    </div>
                  ) : (
                    // Normal input UI - FIXED LAYOUT
                    <form onSubmit={handleSendTextMessage} className="flex gap-2 w-full py-1">
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={textMessage}
                          onChange={(e) => setTextMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="w-full px-3 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={isTyping || isRecording}
                        />
                      </div>
                      <div className="flex gap-2">
                        {/* Voice Recording Button - updated disabled condition */}
                        <div className="relative group">
                          <button
                            type="button"
                            onMouseDown={startVoiceRecording}
                            onMouseUp={stopVoiceRecording}
                            onMouseLeave={stopVoiceRecording}
                            onTouchStart={startVoiceRecording}
                            onTouchEnd={stopVoiceRecording}
                            disabled={isTyping || !wsConnected}
                            className={cn(
                              "px-4 py-2 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors h-full aspect-square cursor-pointer",
                              isTyping || !wsConnected
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600 focus:ring-green-500"
                            )}
                          >
                            🎙️
                          </button>
                          {/* Updated tooltip text */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                              Press &apos;P&apos; or click & hold to record
                              <div className="w-2 h-2 bg-gray-800 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                            </div>
                          </div>
                        </div>
                        {/* Send Button - FIXED WIDTH */}
                        <button
                          type="submit"
                          disabled={!textMessage.trim() || isTyping || isRecording}
                          className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                        >
                          {isTyping ? "..." : "Send"}
                        </button>
                      </div>
                    </form>
                  )}
                  {!wsConnected && (
                    <p className="text-xs text-red-500 mt-2 text-center">
                      WebSocket disconnected - Voice recording unavailable
                    </p>
                  )}
                </div>
              </div>
              /*NEW */
            )}
            {/* NEW */}
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