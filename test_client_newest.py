import asyncio
import websockets
import json
import base64
import sounddevice as sd
import soundfile as sf
import threading
import time
import numpy as np
from pathlib import Path
import tempfile
import io
import queue
import signal
import sys
from concurrent.futures import ThreadPoolExecutor
import datetime
# import Dict
import os
from typing import Dict, Optional
import httpx
class VoicebotSTTClient:
    # replace localhost with 172.17.180.124 when running away from the server
    def __init__(self, host="172.17.180.124", port=8000, 
                 tenant_id="d7acb015-1ce6-451d-b253-d7455070b4b4",user_id="f00ce248-5a04-41f5-97ca-828d24ea265a"):
        self.host = host
        self.port = port
        self.pending_queries: Dict[str, asyncio.Future] = {}

        self.token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjAwY2UyNDgtNWEwNC00MWY1LTk3Y2EtODI4ZDI0ZWEyNjVhIiwidGVuYW50X2lkIjoiZDdhY2IwMTUtMWNlNi00NTFkLWIyNTMtZDc0NTUwNzBiNGI0IiwiaXNfYWRtaW4iOnRydWUsImV4cCI6MTc1NDM3ODEzMH0.ge9ozk7RsT3xr60NvYSrmI_-LSKGIkwgg6tnfYrjBTQ"
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.websocket_url = f"ws://{host}:{port}/ws/{tenant_id}/{user_id}"
        self.websocket = None
        self.recording = False
        self.response_event = asyncio.Event()
        self.streaming = False
        self.audio_queue = queue.Queue(maxsize=100)
        self.stop_event = threading.Event()
        
        self.rag=True

        # Audio settings optimized for backend processing
        self.sample_rate = 16000
        self.channels = 1
        self.chunk_duration_ms = 300
        self.chunk_size = int(self.sample_rate * self.chunk_duration_ms / 1000)
        
        # Buffer management
        self.audio_buffer = np.array([], dtype=np.int16)
        self.min_buffer_size = self.chunk_size * 10  # 1 second
        self.max_buffer_size = self.chunk_size * 30  # 3 seconds
        
        # CLI-style tracking
        self.chunk_counter = 0
        self.session_start_time = None
        
        # Thread pool for audio processing
        self.executor = ThreadPoolExecutor(max_workers=2)        
        self.input_device = None  # Add this line

    def list_input_devices(self):
        print("\nAvailable input devices:")
        devices = sd.query_devices()
        input_devices = [d for d in devices if d['max_input_channels'] > 0]
        for idx, dev in enumerate(input_devices):
            print(f"{idx}: {dev['name']} (ID: {dev['index']})")
        return input_devices

    def select_input_device(self):
        input_devices = self.list_input_devices()
        if not input_devices:
            print("❌ No input devices found.")
            return
        try:
            choice = int(input("Select input device by number (or press Enter for default): ") or -1)
            if 0 <= choice < len(input_devices):
                self.input_device = input_devices[choice]['index']
                dev_info = sd.query_devices(self.input_device)
                default_samplerate = int(dev_info['default_samplerate'])
                print(f"✅ Selected device: {dev_info['name']}")
                print(f"   Default sample rate: {default_samplerate}")
                self.sample_rate = default_samplerate  # Set to device's default
            else:
                self.input_device = None
                print("ℹ️ Using default input device.")
        except Exception as e:
            self.input_device = None
            print(f"ℹ️ Using default input device. Error: {e}")

    async def connect(self):
        """Connect to the WebSocket"""
        try:
            print(f"🔗 Connecting to {self.websocket_url}")
            self.websocket = await websockets.connect(self.websocket_url)
            print("✅ Connected to WebSocket")
            self.session_start_time = time.time()
            return True
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False
    
    async def disconnect(self):
        """Disconnect from WebSocket"""
        if self.websocket:
            await self.websocket.close()
            print("🔌 Disconnected from WebSocket")
    
    def audio_callback(self, indata, frames, time, status):
        """Audio callback - mimics CLI audio capture"""
        if status:
            print(f"⚠️ Audio callback status: {status}")
        
        if self.recording and not self.stop_event.is_set():
            mono_audio = indata[:, 0] if len(indata.shape) > 1 else indata.flatten()
            audio_int16 = (mono_audio * 32767).astype(np.int16)
            
            try:
                self.audio_queue.put_nowait(audio_int16)
            except queue.Full:
                print("⚠️ Audio queue full, dropping chunk")

    async def submit_text_query(self):
        query = input("Enter your text query: ").strip()
        self.api_url = f"http://{self.host}:{self.port}"

        if not self.token:
            self.token = input("Enter your JWT access token: ").strip()
        if not query:
            print("❌ Query cannot be empty")
            return

        url = f"{self.api_url}/query/submit"
        payload = {
            "tenant_id": self.tenant_id,
            "user_id": self.user_id,
            "query": query,
            "use_rag": self.rag
        }
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, headers=headers)
                if response.status_code != 200:
                    print(f"❌ Server error: {response.status_code}")
                    return

                result = response.json()
                query_id = result.get("query_id")
                if not query_id:
                    print("❌ No query_id returned from server.")
                    return

                # Create a future and wait for response
                loop = asyncio.get_event_loop()
                future = loop.create_future()
                self.pending_queries[query_id] = future

                print(f"📨 Query submitted. Waiting for response for query_id={query_id}...")
                response_data = await asyncio.wait_for(future, timeout=30.0)
                print(f"✅ Got response: {response_data}")

            except asyncio.TimeoutError:
                print("❌ Timed out waiting for response.")
                self.pending_queries.pop(query_id, None)
            except Exception as e:
                print(f"❌ Error sending or receiving query: {e}")



    async def start_cli_style_pipeline(self, duration=None):
        """Start CLI-style continuous streaming using correct backend message types"""
        if not self.websocket:
            print("❌ Not connected to WebSocket")
            return
        
        print("\n🎙️ Starting CLI-style Audio Processing Pipeline")
        print("=" * 60)
        print("🔄 Audio Recorder → STT → RAG → TTS Pipeline")
        print("📝 Output will match your CLI application format")
        if duration:
            print(f"⏰ Duration: {duration} seconds")
        else:
            print("⏰ Press Ctrl+C to stop")
        print("=" * 60)
        
        try:
            # Start continuous conversation mode (correct message type)
            await self.start_continuous_conversation()
            
            # Start recording and streaming
            await self.start_recording()
            streaming_task = asyncio.create_task(
                self.process_audio_chunks_continuously(duration)
            )
            await streaming_task
            
        except KeyboardInterrupt:
            print("\n🛑 Interrupted by user")
        except Exception as e:
            print(f"❌ Error in streaming: {e}")
        finally:
            await self.stop_recording()
            await self.stop_continuous_conversation()
    
    async def start_continuous_conversation(self):
        """Start continuous conversation mode (correct message type)"""
        if not self.websocket:
            print("❌ Not connected to WebSocket")
            return
        
        try:
            message = {
                "type": "start_continuous_conversation"
            }
            
            await self.websocket.send(json.dumps(message))
            print("✅ Continuous conversation mode started")
            
        except Exception as e:
            print(f"❌ Error starting continuous conversation: {e}")
    
    async def stop_continuous_conversation(self):
        """Stop continuous conversation mode"""
        # clear the buffer
        self.audio_buffer = np.array([], dtype=np.int16)
        self.chunk_counter = 0
        if not self.websocket:
            return
        
        try:
            message = {
                "type": "stop_continuous_conversation"
            }
            
            await self.websocket.send(json.dumps(message))
            print("✅ Continuous conversation mode stopped")
            
        except Exception as e:
            print(f"❌ Error stopping continuous conversation: {e}")
    
    async def start_recording(self):
        """Start audio recording"""
        try:
            print("🎤 Starting audio capture...")
            print("🎧 Listening...")  # Match CLI output
            
            self.recording = True
            self.streaming = True
            self.stop_event.clear()
            self.chunk_counter = 0
            
            # Clear buffers
            self.audio_buffer = np.array([], dtype=np.int16)
            while not self.audio_queue.empty():
                try:
                    self.audio_queue.get_nowait()
                except queue.Empty:
                    break
            
            # Start audio stream
            self.audio_stream = sd.InputStream(
                samplerate=self.sample_rate,
                channels=self.channels,
                callback=self.audio_callback,
                blocksize=self.chunk_size,
                dtype='float32',
                latency='low',
                device=self.input_device  # Add this line
            )
            self.audio_stream.start()
            print("✅ Audio capture started")
            
        except Exception as e:
            print(f"❌ Failed to start recording: {e}")
            self.recording = False
            self.streaming = False
    
    async def stop_recording(self):
        """Stop audio recording"""
        print("🛑 Stopping audio capture...")
        self.recording = False
        self.streaming = False
        self.stop_event.set()
        
        if hasattr(self, 'audio_stream'):
            try:
                self.audio_stream.stop()
                self.audio_stream.close()
            except Exception as e:
                print(f"⚠️ Warning stopping audio stream: {e}")
        
        # Send any remaining audio
        if len(self.audio_buffer) > 0:
            await self.send_audio_chunk(self.audio_buffer, is_final=True)
            self.audio_buffer = np.array([], dtype=np.int16)
        
        print("✅ Audio capture stopped")
    
    async def process_audio_chunks_continuously(self, duration=None):
        """Process audio chunks continuously"""
        start_time = time.time()
        last_send_time = start_time
        
        print("📡 Starting continuous audio processing...")
        
        while self.streaming and not self.stop_event.is_set():
            current_time = time.time()
            
            # Check duration limit
            if duration and (current_time - start_time) >= duration:
                print(f"\n⏰ Duration limit reached ({duration}s)")
                break
            
            try:
                audio_chunk = self.audio_queue.get(timeout=0.05)
                self.audio_buffer = np.concatenate([self.audio_buffer, audio_chunk])
                
                # Send when we have enough audio
                should_send = len(self.audio_buffer) >= self.chunk_size
                
                if should_send:
                    await self.send_audio_chunk(self.audio_buffer)
                    
                    # Clear buffer completely for next chunk
                    self.audio_buffer = np.array([], dtype=np.int16)
                    last_send_time = current_time
                    self.chunk_counter += 1
            
            except queue.Empty:
                await asyncio.sleep(0.01)
                continue
            except Exception as e:
                print(f"❌ Error processing audio: {e}")
                break
        
        print(f"✅ Audio processing complete")
    
    async def send_audio_chunk(self, audio_data, is_final=False):
        """Send audio chunk via WebSocket using correct message type"""
        try:
            audio_b64 = base64.b64encode(audio_data.tobytes()).decode('utf-8')
            
            # Use the correct message type that backend expects
            message = {
                "type": "continuous_audio_stream",
                "rag": self.rag,  # Enable RAG processing
                "audio": audio_b64,
                "sample_rate": self.sample_rate,
                "channels": self.channels,
                "conversation_mode": True,  # Enable conversation mode for auto-response
                "auto_respond": True,       # Enable automatic responses
                "tts_language": "en",
                "voice": "Fritz-PlayAI",
                "timestamp": int(time.time() * 1000)
            }
            
            await self.websocket.send(json.dumps(message))
            
        except Exception as e:
            print(f"❌ Error sending audio chunk: {e}")
    
    async def listen_for_responses(self):
        """Listen for responses from WebSocket - CLI-style output"""
        if not self.websocket:
            print("❌ Not connected to WebSocket")
            return
        
        try:
            async for message in self.websocket:
                try:
                    data = json.loads(message)
                    try:
                        data = json.loads(message)
                        if isinstance(data, dict) and "type" in data:
                            message_type = data.get("type", "unknown")
                        else:
                            print(f"❌ Received non-dict message: {data}")
                            message_type = "unknown"
                    except Exception as e:
                        print(f"❌ Error decoding message: {e}")
                        message_type = "unknown"
                    # Handle different message types with CLI-style formatting

                    if message_type == "transcription_result":
                        await self.handle_transcription_result(data)
                    elif message_type in ("query_result", "query_with_tts_result", "text_response"):
                        query_id = data.get("query_id")
                        if query_id and query_id in self.pending_queries:
                            future = self.pending_queries.pop(query_id)
                            if not future.done():
                                future.set_result(data)
                                print(f"✅ [QUERY] Got response for {query_id[:8]}")
                        else:
                            print(f"🤖 [QUERY] {message_type}: {data}")

                    elif message_type == "speech_detected":
                        await self.handle_speech_detected(data)
                    elif message_type == "query_result":
                        await self.handle_query_response(data)
                    elif message_type == "query_with_tts_result":
                        await self.handle_query_response(data)
                        
                    elif message_type == "query_with_tts_submitted":
                        # Query was submitted for processing
                        query_id = data.get('query_id', 'N/A')
                        print(f"🔄 [QUERY] Processing query {query_id[:8]}...")
                        
                    elif message_type == "audio_status":
                        await self.handle_audio_status(data)
                        
                    elif message_type == "audio_stream":
                        await self.handle_audio_stream(data)
                    elif message_type == "text_response":
                        print(f"🤖 Response: {data}")
                    elif message_type == "transcription_submitted":
                        # Transcription was submitted for processing
                        transcription_id = data.get('transcription_id', 'N/A')
                        print(f"📝 Transcribing at {datetime.datetime.now().strftime('%H:%M:%S')}")
                        
                    elif message_type == "continuous_conversation_started":
                        print("🔄 [SESSION] Continuous conversation started")
                        
                    elif message_type == "continuous_conversation_stopped":
                        print("🔄 [SESSION] Continuous conversation stopped")
                        
                    elif message_type == "error":
                        if data.type is str:
                            print(f"❌ [ERROR] {data}")
                        else:
                            # Handle structured error messages
                            error_msg = data.get('message', 'Unknown error')
                            print(f"\n❌ [ERROR] {error_msg}")
                        
                    elif message_type == "ping":
                        # Respond to ping
                        await self.websocket.send(json.dumps({"type": "pong"}))
                        
                    elif message_type == "pong":
                        print("🏓 Pong received")
                        
                    else:
                        print(f"❓ Unknown message type: {message_type}")
                        # Don't show unknown messages as errors, backend may send other types
                        pass
                        
                except json.JSONDecodeError:
                    print(f"❌ Invalid JSON received: {message}")
                except Exception as e:
                    print(f"❌ Error processing message: {e}")
                    
        except websockets.exceptions.ConnectionClosed:
            print("🔌 WebSocket connection closed")
        except Exception as e:
            print(f"❌ Error listening for responses: {e}")
    
    async def handle_transcription_result(self, data):
        """Handle transcription results - CLI format"""
        transcript = data.get('transcript', '').strip()
        chunk_id = data.get('chunk_id', 'N/A')
        confidence = data.get('confidence', 0.0)
        processing_time = data.get('processing_time', 0.0)
        
        if transcript:
            # Format like CLI output
            timestamp = datetime.datetime.now().strftime('%H:%M:%S')
            chunk_num = chunk_id.split('_')[-1] if '_' in chunk_id else chunk_id
            
          
            
            print(f"⏱ Transcription took {processing_time:.2f} seconds")
           
            # If this triggers a query, show the generating message
            if len(transcript.split()) > 1:  # Only for meaningful transcripts
                print(f"🧑 Generating response for: {transcript}")
               
    async def handle_speech_detected(self, data):
        """Handle speech detection"""
        transcript = data.get('transcript', 'N/A')
        duration = data.get('duration', 0.0)
        # Only show if it's a meaningful transcript (backend shows these)
        if transcript and len(transcript.strip()) > 2:
            print(f"\n🗣️ [SPEECH] {transcript} ({duration:.1f}s)")
    
    async def handle_query_response(self, data):
        """Handle query response - CLI format"""
        
        response_text = data.get('response', 'N/A')
        query = data.get('query', 'N/A')
        timestamp = datetime.datetime.now().strftime('%H:%M:%S')
        
        # Display like CLI
        print(f"🤖 Response: {response_text}")
       
      
    async def handle_audio_status(self, data):
        """Handle TTS audio status"""
        status = data.get('status', 'N/A')
        task_id = data.get('task_id', 'N/A')
        
        if status == "ready":
            filename = data.get('data', {}).get('filename', 'N/A')
            print(f"🔊 [TTS] Ready: {filename}")
        elif status == "generating":
            print(f"🔄 [TTS] Generating...")
        elif status == "streaming":
            print(f"🎵 [TTS] Streaming audio...")
    
    async def handle_audio_stream(self, data):
        """Handle audio stream"""
        task_id = data.get('task_id', 'N/A')
        print(f"🎵 [AUDIO] Stream received (Task: {task_id[:8]})")
    
    async def send_audio_file(self, file_path):
        """Send an audio file for transcription"""
        if not self.websocket:
            print("❌ Not connected to WebSocket")
            return
        
        try:
            data, sample_rate = sf.read(file_path)
            print(f"📂 Reading audio file: {file_path}")
            print(f"   Sample rate: {sample_rate}")
            print(f"   Channels: {data.shape[1] if len(data.shape) > 1 else 1}")
            print(f"   Duration: {len(data) / sample_rate:.2f}s")
            
            # Convert to mono if stereo
            if len(data.shape) > 1:
                data = np.mean(data, axis=1)
            
            # Resample if needed
            if sample_rate != self.sample_rate:
                print(f"   Resampling from {sample_rate} to {self.sample_rate}")
                try:
                    import scipy.signal
                    data = scipy.signal.resample(data, int(len(data) * self.sample_rate / sample_rate))
                except ImportError:
                    data = np.interp(
                        np.linspace(0, len(data), int(len(data) * self.sample_rate / sample_rate)),
                        np.arange(len(data)),
                        data
                    )
            
            # Convert to 16-bit integers
            data = (data * 32767).astype(np.int16)
            
            # Send complete file as audio stream
            audio_b64 = base64.b64encode(data.tobytes()).decode('utf-8')
            
            message = {
                "type": "audio_stream",
                "audio": audio_b64,
                "sample_rate": self.sample_rate,
                "channels": self.channels,
                "conversation_mode": False,  # Single file processing
                "final": True
            }
            
            await self.websocket.send(json.dumps(message))
            print("✅ Audio file sent for transcription")
            
        except Exception as e:
            print(f"❌ Error sending audio file: {e}")
    
    async def test_query_with_tts(self, query):
        """Test text query with TTS"""
        if not self.websocket:
            print("❌ Not connected to WebSocket")
            return
        
        try:
            # Show like CLI
            timestamp = datetime.datetime.now().strftime('%H:%M:%S')
            print(f"🧑 Generating response for: {query}")
        
            message = {
                "type": "query_with_tts",
                "message": query,
                "max_tokens": 500,
                "temperature": 0.7,
                "language": "en",
                "voice": "Fritz-PlayAI",
                "stream_audio": True
            }
            
            await self.websocket.send(json.dumps(message))
            print(f"✅ Query sent: {query}")
            
        except Exception as e:
            print(f"❌ Error sending query: {e}")
    
    async def send_ping(self):
        """Send ping to test connection"""
        if not self.websocket:
            print("❌ Not connected to WebSocket")
            return
        
        try:
            message = {"type": "ping"}
            await self.websocket.send(json.dumps(message))
            print("🏓 Ping sent")
        except Exception as e:
            print(f"❌ Error sending ping: {e}")
    
    def cleanup(self):
        """Clean up resources"""
        self.stop_event.set()
        
        if hasattr(self, 'audio_stream'):
            try:
                self.audio_stream.stop()
                self.audio_stream.close()
            except Exception as e:
                print(f"⚠️ Warning during cleanup: {e}")
        
        if hasattr(self, 'executor'):
            self.executor.shutdown(wait=True)

# Signal handler for graceful shutdown
def signal_handler(signum, frame):
    print("\n🛑 Received interrupt signal, shutting down...")
    sys.exit(0)

async def cli_loop(client):
    print("\n🎯Voicebot Client:")
    print("1. Voicecall")
    print("2. Text Query")
    print("3. Exit")
    print("4. turn rag off")       
    print("5. turn rag on") 
    while True:
        try:
            choice = input("\nEnter your choice (1-4): ").strip()
            if choice == "1":
                await client.start_cli_style_pipeline()
            elif choice == "2":
                await client.submit_text_query()
            elif choice == "3":
                print("👋 Exiting...")
                break
            elif choice == "4":
                client.rag = False
                print("ℹ️ RAG processing disabled for voicecall")
            elif choice == "5":
                client.rag = True
                print("ℹ️ RAG processing enabled for voicecall")
            else:
                print("❌ Invalid choice, please try again")
        except KeyboardInterrupt:
            print("\n🛑 Interrupted by user")
            break
        except EOFError:
            print("\n🛑 Input stream ended")
            break

async def main():
    signal.signal(signal.SIGINT, signal_handler)
    client = VoicebotSTTClient()
    try:
        if not await client.connect():
            return
        client.select_input_device()
        # Run both CLI and listener concurrently
        await asyncio.gather(
            client.listen_for_responses(),
            cli_loop(client)
        )
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await client.disconnect()
        client.cleanup()

if __name__ == "__main__":
    print("🎙️ Style WebSocket Voice Client")
    print("=" * 60)

    print("📝 Transcribing at HH:MM:SS")
    print("⏱ Transcription took X.XX seconds")  
    print("🧑 Generating response for: [query]")
    print("🤖 Response: [response]")
    print("🗣 Speaking: [text]")
    print("📚 Source citations")
    print("=" * 60)
    
    asyncio.run(main())