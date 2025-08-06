import asyncio
import time
import queue
import json
import base64
import uuid
import datetime
import websockets
import httpx
import numpy as np
import sounddevice as sd
import threading
import logging
from typing import Dict, List, Optional, Any
from collections import defaultdict, deque
import os
import wave

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AudioPlayer:
    """Simple audio player for TTS responses"""
    def __init__(self, sample_rate=22050):
        self.sample_rate = sample_rate
        self.play_queue = queue.Queue()
        self.playing = False
        self.player_thread = None
        
    def start(self):
        """Start the audio player thread"""
        if not self.playing:
            self.playing = True
            self.player_thread = threading.Thread(target=self._player_loop, daemon=True)
            self.player_thread.start()
            logger.info("🔊 Audio player started")
    
    def stop(self):
        """Stop the audio player"""
        self.playing = False
        if self.player_thread:
            self.player_thread.join(timeout=1)
        logger.info("🔇 Audio player stopped")
    
    def play_audio(self, audio_data: bytes, format_type: str = "wav"):
        """Queue audio data for playback"""
        try:
            self.play_queue.put_nowait((audio_data, format_type))
        except queue.Full:
            logger.warning("⚠️ Audio play queue full, dropping audio")
    
    def _player_loop(self):
        """Audio player loop"""
        while self.playing:
            try:
                audio_data, format_type = self.play_queue.get(timeout=0.1)
                if format_type == "base64":
                    audio_data = base64.b64decode(audio_data)
                
                # Simple playback using sounddevice
                try:
                    import soundfile as sf
                    import io
                    
                    # Read audio data
                    audio_array, sample_rate = sf.read(io.BytesIO(audio_data))
                    
                    # Play audio
                    sd.play(audio_array, sample_rate)
                    sd.wait()  # Wait for playback to finish
                    
                except Exception as e:
                    logger.error(f"❌ Error playing audio: {e}")
                    
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"❌ Audio player error: {e}")

class MessageStats:
    """Track message statistics"""
    def __init__(self):
        self.message_counts = defaultdict(int)
        self.last_messages = deque(maxlen=100)
        self.errors = deque(maxlen=50)
        self.start_time = time.time()
        
    def record_message(self, msg_type: str, data: dict = None):
        self.message_counts[msg_type] += 1
        self.last_messages.append({
            'type': msg_type,
            'timestamp': time.time(),
            'data': data
        })
    
    def record_error(self, error: str, context: str = ""):
        self.errors.append({
            'error': error,
            'context': context,
            'timestamp': time.time()
        })
    
    def get_stats(self) -> dict:
        uptime = time.time() - self.start_time
        return {
            'uptime_seconds': uptime,
            'message_counts': dict(self.message_counts),
            'total_messages': sum(self.message_counts.values()),
            'error_count': len(self.errors),
            'messages_per_minute': sum(self.message_counts.values()) / (uptime / 60) if uptime > 0 else 0
        }

class ComprehensiveVoicebotClient:
    """Enhanced voicebot client with comprehensive features and listeners"""
    
    def __init__(self, host="localhost", port=8000, 
                 tenant_id="d7acb015-1ce6-451d-b253-d7455070b4b4",
                 user_id="f00ce248-5a04-41f5-97ca-828d24ea265a"):
        self.host = host
        self.port = port
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.device_id = str(uuid.uuid4())[:8]  # Generate device ID
        self.session_id = None
        
        # WebSocket connection
        self.websocket_url = f"ws://{host}:{port}/ws/{tenant_id}/{user_id}?device_id={self.device_id}"
        self.websocket = None
        self.connected = False
        
        # Audio settings
        self.sample_rate = 16000
        self.channels = 1
        self.chunk_duration_ms = 100
        self.chunk_size = int(self.sample_rate * self.chunk_duration_ms / 1000)
        self.input_device = None
        
        # Audio management
        self.recording = False
        self.audio_queue = queue.Queue(maxsize=10)
        self.audio_stream = None
        self.audio_player = AudioPlayer()
        
        # State management
        self.use_rag = True
        self.auto_respond = True
        self.tts_enabled = True
        self.tts_language = "en"
        self.voice = "Fritz-PlayAI"
        self.conversation_active = False
        
        # Statistics and monitoring
        self.stats = MessageStats()
        self.message_handlers = {}
        self.setup_message_handlers()
        
        # Conversation history
        self.conversation_history = deque(maxlen=100)
        self.pending_queries = {}  # Track pending queries by ID
        
        # Audio file saving
        self.save_audio = False
        self.audio_save_path = "recorded_audio"
        
    def setup_message_handlers(self):
        """Setup message type handlers"""
        self.message_handlers = {
            'session_info': self._handle_session_info,
            'ping': self._handle_ping,
            'pong': self._handle_pong,
            'error': self._handle_error,
            'transcription_result': self._handle_transcription_result,
            'query_result': self._handle_query_result,
            'audio_chunk_processed': self._handle_audio_chunk_processed,
            'audio_chunk_accumulating': self._handle_audio_chunk_accumulating,
            'audio_stream': self._handle_audio_stream,
            'audio_stream_error': self._handle_audio_stream_error,
            'query_submitted': self._handle_query_submitted,
            'query_with_tts_submitted': self._handle_query_with_tts_submitted,
            'continuous_conversation_started': self._handle_conversation_started,
            'continuous_conversation_stopped': self._handle_conversation_stopped,
            'transcription_submitted': self._handle_transcription_submitted,
            'transcription_error': self._handle_transcription_error,
            'speech_detected': self._handle_speech_detected,
            'system_status': self._handle_system_status,
            'connection_drop': self._handle_connection_drop,
            'redis_health': self._handle_redis_health,
            'audio_status': self._handle_audio_status,
            'text_response': self._handle_text_response,
            'health_check': self._handle_health_check
        }

    # Message Handlers
    async def _handle_session_info(self, data: dict):
        self.session_id = data.get('session_id')
        logger.info(f"📋 Session info: {self.session_id}, Device: {data.get('device_id')}")

    async def _handle_ping(self, data: dict):
        await self.websocket.send(json.dumps({"type": "pong", "timestamp": time.time()}))

    async def _handle_pong(self, data: dict):
        logger.debug(f"🏓 Pong received")

    async def _handle_error(self, data: dict):
        error_msg = data.get('message', 'Unknown error')
        logger.error(f"❌ Server error: {error_msg}")
        self.stats.record_error(error_msg, "server_error")

    async def _handle_transcription_result(self, data: dict):
        transcript = data.get('transcript', '').strip()
        confidence = data.get('confidence', 0)
        query_id = data.get('query_id', '')
        
        if transcript:
            logger.info(f"📝 Transcription: '{transcript}' (confidence: {confidence:.2f})")
            self.conversation_history.append({
                'type': 'user_speech',
                'content': transcript,
                'timestamp': time.time(),
                'query_id': query_id,
                'confidence': confidence
            })

    async def _handle_query_result(self, data: dict):
        response = data.get('response', '')
        query_id = data.get('query_id', '')
        query = data.get('query', '')
        
        logger.info(f"🤖 Bot response: {response}")
        self.conversation_history.append({
            'type': 'bot_response',
            'content': response,
            'timestamp': time.time(),
            'query_id': query_id,
            'original_query': query
        })
        
        # Mark query as completed
        if query_id in self.pending_queries:
            self.pending_queries[query_id]['response'] = response
            self.pending_queries[query_id]['completed'] = True

    async def _handle_audio_chunk_processed(self, data: dict):
        chunk_id = data.get('chunk_id', '')
        reason = data.get('reason', '')
        segments = data.get('speech_segments_processed', 0)
        remaining = data.get('speech_segments_remaining', 0)
        duration = data.get('buffer_duration_ms', 0)
        
        logger.info(f"✅ Audio processed: {reason} (ID: {chunk_id[:8]}, {segments} segments, {duration:.0f}ms)")

    async def _handle_audio_chunk_accumulating(self, data: dict):
        duration = data.get('buffer_duration_ms', 0)
        logger.debug(f"🔄 Audio buffering: {duration:.0f}ms")

    async def _handle_audio_stream(self, data: dict):
        """Handle incoming audio stream (TTS responses)"""
        task_id = data.get('task_id', '')
        audio_data = data.get('audio_data', '')
        format_type = data.get('format', 'wav')
        
        logger.info(f"🔊 Received audio stream: {task_id[:8]}")
        
        if self.tts_enabled and audio_data:
            if format_type == "base64":
                self.audio_player.play_audio(audio_data, "base64")
            else:
                self.audio_player.play_audio(base64.b64decode(audio_data), format_type)

    async def _handle_audio_stream_error(self, data: dict):
        task_id = data.get('task_id', '')
        error = data.get('error', '')
        logger.error(f"❌ Audio stream error: {error} (Task: {task_id[:8]})")

    async def _handle_query_submitted(self, data: dict):
        query_id = data.get('query_id', '')
        query = data.get('query', '')
        logger.info(f"📤 Query submitted: {query} (ID: {query_id[:8]})")
        
        self.pending_queries[query_id] = {
            'query': query,
            'submitted_at': time.time(),
            'completed': False
        }

    async def _handle_query_with_tts_submitted(self, data: dict):
        query_id = data.get('query_id', '')
        tts_task_id = data.get('tts_task_id', '')
        query = data.get('query', '')
        logger.info(f"📤 Query+TTS submitted: {query} (ID: {query_id[:8]}, TTS: {tts_task_id[:8]})")

    async def _handle_conversation_started(self, data: dict):
        logger.info(f"🎙️ Continuous conversation started")
        self.conversation_active = True

    async def _handle_conversation_stopped(self, data: dict):
        logger.info(f"🛑 Continuous conversation stopped")
        self.conversation_active = False

    async def _handle_transcription_submitted(self, data: dict):
        logger.debug(f"📤 Transcription submitted")

    async def _handle_transcription_error(self, data: dict):
        error = data.get('error', '')
        logger.error(f"❌ Transcription error: {error}")

    async def _handle_speech_detected(self, data: dict):
        logger.debug(f"🗣️ Speech detected")

    async def _handle_system_status(self, data: dict):
        logger.debug(f"💻 System status update")

    async def _handle_connection_drop(self, data: dict):
        logger.warning(f"🔌 Connection drop detected")

    async def _handle_redis_health(self, data: dict):
        logger.debug(f"🗄️ Redis health update")

    async def _handle_audio_status(self, data: dict):
        status = data.get('status', '')
        logger.debug(f"🎵 Audio status: {status}")

    async def _handle_text_response(self, data: dict):
        response = data.get('response', '')
        logger.info(f"📝 Text response ready: {response}")

    async def _handle_health_check(self, data: dict):
        logger.debug(f"❤️ Health check")

    # Device management
    def list_input_devices(self):
        """List available audio input devices"""
        print("\n🎙️ Available input devices:")
        devices = sd.query_devices()
        input_devices = [d for d in devices if d['max_input_channels'] > 0]
        for idx, dev in enumerate(input_devices):
            print(f"  {idx}: {dev['name']} ({dev['max_input_channels']} channels)")
        return input_devices

    def select_input_device(self):
        """Let user select input device"""
        input_devices = self.list_input_devices()
        if not input_devices:
            print("❌ No input devices found.")
            return
        try:
            choice = input("Select device number (or Enter for default): ").strip()
            if choice and choice.isdigit():
                idx = int(choice)
                if 0 <= idx < len(input_devices):
                    self.input_device = input_devices[idx]['index']
                    print(f"✅ Selected: {input_devices[idx]['name']}")
                else:
                    print("ℹ️ Using default device.")
            else:
                print("ℹ️ Using default device.")
        except Exception as e:
            print(f"⚠️ Error selecting device: {e}. Using default.")

    # Connection management
    async def connect(self):
        """Connect to WebSocket with retry logic"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                logger.info(f"🔌 Connecting to {self.websocket_url} (attempt {attempt + 1})")
                self.websocket = await websockets.connect(
                    self.websocket_url,
                    ping_interval=30,
                    ping_timeout=10,
                    close_timeout=10
                )
                self.connected = True
                logger.info("✅ Connected to WebSocket")
                
                # Start audio player
                self.audio_player.start()
                
                return True
            except Exception as e:
                logger.error(f"❌ Connection attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                
        return False
    
    async def disconnect(self):
        """Disconnect from WebSocket"""
        self.connected = False
        if self.websocket:
            await self.websocket.close()
            logger.info("🔌 Disconnected")
        
        # Stop audio components
        await self.stop_recording()
        self.audio_player.stop()

    # Audio management
    def audio_callback(self, indata, frames, time, status):
        """Audio input callback"""
        if status:
            logger.warning(f"⚠️ Audio status: {status}")
        
        if self.recording and self.connected:
            try:
                # Convert to mono int16
                mono_audio = indata[:, 0] if len(indata.shape) > 1 else indata.flatten()
                audio_int16 = (mono_audio * 32767).astype(np.int16)
                
                # Save to file if enabled
                if self.save_audio:
                    self._save_audio_chunk(audio_int16)
                
                self.audio_queue.put_nowait(audio_int16)
                
            except queue.Full:
                pass  # Drop if queue full
            except Exception as e:
                logger.error(f"❌ Audio callback error: {e}")

    def _save_audio_chunk(self, audio_data: np.ndarray):
        """Save audio chunk to file"""
        try:
            if not os.path.exists(self.audio_save_path):
                os.makedirs(self.audio_save_path)
            
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{self.audio_save_path}/audio_{timestamp}_{uuid.uuid4().hex[:8]}.wav"
            
            with wave.open(filename, 'wb') as wf:
                wf.setnchannels(self.channels)
                wf.setsampwidth(2)  # 16-bit
                wf.setframerate(self.sample_rate)
                wf.writeframes(audio_data.tobytes())
                
        except Exception as e:
            logger.error(f"❌ Error saving audio: {e}")

    async def start_recording(self):
        """Start audio recording"""
        if self.recording:
            return
        
        try:
            self.recording = True
            self.audio_stream = sd.InputStream(
                samplerate=self.sample_rate,
                channels=self.channels,
                callback=self.audio_callback,
                blocksize=self.chunk_size,
                dtype='float32',
                device=self.input_device
            )
            self.audio_stream.start()
            logger.info("🎤 Recording started")
            
        except Exception as e:
            logger.error(f"❌ Failed to start recording: {e}")
            self.recording = False

    async def stop_recording(self):
        """Stop audio recording"""
        self.recording = False
        if self.audio_stream:
            try:
                self.audio_stream.stop()
                self.audio_stream.close()
                self.audio_stream = None
                logger.info("🎤 Recording stopped")
            except Exception as e:
                logger.error(f"❌ Error stopping recording: {e}")

    # Core functionality
    async def start_voice_conversation(self):
        """Start continuous voice conversation"""
        if not self.connected:
            logger.error("❌ Not connected")
            return
        
        logger.info("🎙️ Starting voice conversation")
        print("📱 Controls:")
        print("  - Speaking is continuous")
        print("  - Press Ctrl+C to stop")
        print("  - Backend handles VAD and processing")
        
        try:
            # Tell backend to start continuous conversation
            await self.websocket.send(json.dumps({
                "type": "start_continuous_conversation"
            }))
            
            # Start recording
            await self.start_recording()
            
            # Audio sending loop
            while self.recording and self.connected:
                try:
                    # Get audio chunk with timeout
                    audio_chunk = await asyncio.get_event_loop().run_in_executor(
                        None, self.audio_queue.get, True, 0.1
                    )
                    
                    # Send audio chunk
                    await self.send_audio_chunk(audio_chunk)
                    
                except queue.Empty:
                    continue
                except Exception as e:
                    if self.recording:
                        logger.error(f"❌ Audio send error: {e}")
                    break
            
        except KeyboardInterrupt:
            logger.info("🛑 Voice conversation stopped by user")
        except Exception as e:
            logger.error(f"❌ Voice conversation error: {e}")
        finally:
            await self.stop_voice_conversation()

    async def stop_voice_conversation(self):
        """Stop continuous voice conversation"""
        await self.stop_recording()
        
        if self.connected and self.websocket:
            await self.websocket.send(json.dumps({
                "type": "stop_continuous_conversation"
            }))

    async def send_audio_chunk(self, audio_data: np.ndarray):
        """Send audio chunk to server"""
        try:
            audio_b64 = base64.b64encode(audio_data.tobytes()).decode('utf-8')
            
            message = {
                "type": "audio_chunk",
                "audio": audio_b64,
                "sample_rate": self.sample_rate,
                "channels": self.channels,
                "rag": self.use_rag,
                "auto_respond": self.auto_respond,
                "tts_language": self.tts_language,
                "voice": self.voice,
                "chunk_id": str(uuid.uuid4())
            }
            
            await self.websocket.send(json.dumps(message))
            
        except Exception as e:
            logger.error(f"❌ Send audio error: {e}")

    async def send_text_query(self, query: str = None):
        """Send text query"""
        if not query:
            query = input("💬 Enter your query: ").strip()
        
        if not query:
            return
        
        if not self.connected:
            logger.error("❌ Not connected")
            return
        
        query_id = str(uuid.uuid4())
        
        message = {
            "type": "query_with_tts" if self.tts_enabled else "query",
            "query_id": query_id,
            "message": query,
            "rag": self.use_rag,
            "auto_respond": self.auto_respond,
            "tts_language": self.tts_language,
            "voice": self.voice
        }
        
        await self.websocket.send(json.dumps(message))
        logger.info(f"📤 Sent query: {query}")

    # Message listening
    async def listen_for_responses(self):
        """Main message listener with comprehensive handling"""
        try:
            async for message in self.websocket:
                try:
                    data = json.loads(message)
                    msg_type = data.get("type", "unknown")
                    
                    # Record message statistics
                    self.stats.record_message(msg_type, data)
                    
                    # Handle message with specific handler
                    if msg_type in self.message_handlers:
                        await self.message_handlers[msg_type](data)
                    else:
                        logger.warning(f"❓ Unknown message type: {msg_type}")
                        logger.debug(f"   Data: {data}")
                    
                except json.JSONDecodeError as e:
                    logger.error(f"❌ Invalid JSON received: {e}")
                    self.stats.record_error(f"Invalid JSON: {e}", "json_decode")
                except Exception as e:
                    logger.error(f"❌ Error processing message: {e}")
                    self.stats.record_error(f"Message processing: {e}", "message_handler")
                    
        except websockets.exceptions.ConnectionClosed:
            logger.info("🔌 WebSocket connection closed")
            self.connected = False
        except Exception as e:
            logger.error(f"❌ Listen error: {e}")
            self.connected = False

    # Utility methods
    def toggle_rag(self):
        """Toggle RAG usage"""
        self.use_rag = not self.use_rag
        logger.info(f"🧠 RAG: {'ENABLED' if self.use_rag else 'DISABLED'}")

    def toggle_tts(self):
        """Toggle TTS usage"""
        self.tts_enabled = not self.tts_enabled
        logger.info(f"🔊 TTS: {'ENABLED' if self.tts_enabled else 'DISABLED'}")

    def toggle_auto_respond(self):
        """Toggle auto-respond"""
        self.auto_respond = not self.auto_respond
        logger.info(f"🤖 Auto-respond: {'ENABLED' if self.auto_respond else 'DISABLED'}")

    def toggle_audio_saving(self):
        """Toggle audio file saving"""
        self.save_audio = not self.save_audio
        logger.info(f"💾 Audio saving: {'ENABLED' if self.save_audio else 'DISABLED'}")

    def set_voice(self):
        """Set TTS voice"""
        voices = [
            "Fritz-PlayAI", "Aaliyah-PlayAI", "Adelaide-PlayAI", "Angelo-PlayAI",
            "Arista-PlayAI", "Atlas-PlayAI", "Basil-PlayAI", "Briggs-PlayAI",
            "Calum-PlayAI", "Celeste-PlayAI", "Cheyenne-PlayAI"
        ]
        
        print("\n🎭 Available voices:")
        for i, voice in enumerate(voices):
            marker = "👈" if voice == self.voice else "  "
            print(f"  {i}: {voice} {marker}")
        
        try:
            choice = input("Select voice number: ").strip()
            if choice.isdigit():
                idx = int(choice)
                if 0 <= idx < len(voices):
                    self.voice = voices[idx]
                    logger.info(f"🎭 Voice set to: {self.voice}")
        except:
            pass

    def show_conversation_history(self):
        """Show recent conversation history"""
        print("\n📜 Recent Conversation History:")
        print("=" * 60)
        
        for entry in list(self.conversation_history)[-10:]:  # Last 10 entries
            timestamp = datetime.datetime.fromtimestamp(entry['timestamp']).strftime("%H:%M:%S")
            if entry['type'] == 'user_speech':
                print(f"🗣️  [{timestamp}] You: {entry['content']}")
                if 'confidence' in entry:
                    print(f"    (Confidence: {entry['confidence']:.2f})")
            elif entry['type'] == 'bot_response':
                print(f"🤖 [{timestamp}] Bot: {entry['content']}")
        
        if not self.conversation_history:
            print("   No conversation history yet.")

    def show_statistics(self):
        """Show client statistics"""
        stats = self.stats.get_stats()
        
        print("\n📊 Client Statistics:")
        print("=" * 40)
        print(f"⏱️  Uptime: {stats['uptime_seconds']:.1f} seconds")
        print(f"📨 Total messages: {stats['total_messages']}")
        print(f"📈 Messages/minute: {stats['messages_per_minute']:.1f}")
        print(f"❌ Errors: {stats['error_count']}")
        print(f"🔌 Connected: {'✅' if self.connected else '❌'}")
        print(f"🎙️  Recording: {'✅' if self.recording else '❌'}")
        print(f"💬 Conversation active: {'✅' if self.conversation_active else '❌'}")
        
        print("\n📋 Message counts by type:")
        for msg_type, count in stats['message_counts'].items():
            print(f"  {msg_type}: {count}")
        
        print(f"\n⚙️  Current settings:")
        print(f"  🧠 RAG: {'ON' if self.use_rag else 'OFF'}")
        print(f"  🔊 TTS: {'ON' if self.tts_enabled else 'OFF'}")
        print(f"  🤖 Auto-respond: {'ON' if self.auto_respond else 'OFF'}")
        print(f"  💾 Audio saving: {'ON' if self.save_audio else 'OFF'}")
        print(f"  🎭 Voice: {self.voice}")
        print(f"  🗣️  Language: {self.tts_language}")

    def show_pending_queries(self):
        """Show pending queries"""
        print("\n⏳ Pending Queries:")
        print("=" * 50)
        
        pending = [q for q in self.pending_queries.values() if not q['completed']]
        completed = [q for q in self.pending_queries.values() if q['completed']]
        
        print(f"📤 Pending: {len(pending)}")
        for query in pending[-5:]:  # Last 5 pending
            elapsed = time.time() - query['submitted_at']
            print(f"  🔄 {query['query'][:50]}... ({elapsed:.1f}s ago)")
        
        print(f"✅ Completed: {len(completed)}")

async def main():
    """Main client interface"""
    client = ComprehensiveVoicebotClient()
    
    print("🤖 Comprehensive Voicebot Client")
    print("=" * 50)
    print("🎯 Enhanced with full listeners and features!")
    
    try:
        # Connect
        if not await client.connect():
            logger.error("❌ Failed to connect. Exiting.")
            return
        
        # Select input device
        client.select_input_device()
        
        # Start response listener
        listen_task = asyncio.create_task(client.listen_for_responses())
        
        # Show menu
        while True:
            print("\n🎛️  Control Panel:")
            print("1. 🎙️  Start Voice Conversation")
            print("2. 💬 Send Text Query")
            print("3. 🧠 Toggle RAG")
            print("4. 🔊 Toggle TTS")
            print("5. 🤖 Toggle Auto-respond")
            print("6. 🎭 Change Voice")
            print("7. 💾 Toggle Audio Saving")
            print("8. 📜 Show Conversation History")
            print("9. 📊 Show Statistics")
            print("10. ⏳ Show Pending Queries")
            print("11. 🧪 Send Test Message")
            print("12. ❌ Exit")
            
            try:
                choice = input("\nChoice (1-12): ").strip()
                
                if choice == "1":
                    await client.start_voice_conversation()
                elif choice == "2":
                    await client.send_text_query()
                elif choice == "3":
                    client.toggle_rag()
                elif choice == "4":
                    client.toggle_tts()
                elif choice == "5":
                    client.toggle_auto_respond()
                elif choice == "6":
                    client.set_voice()
                elif choice == "7":
                    client.toggle_audio_saving()
                elif choice == "8":
                    client.show_conversation_history()
                elif choice == "9":
                    client.show_statistics()
                elif choice == "10":
                    client.show_pending_queries()
                elif choice == "11":
                    await client.send_text_query("Hello, this is a test message!")
                elif choice == "12":
                    break
                else:
                    print("❌ Invalid choice")
                    
            except KeyboardInterrupt:
                logger.info("🛑 Interrupted by user")
                break
            except EOFError:
                logger.info("🛑 EOF received")
                break
        
        listen_task.cancel()
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
    finally:
        await client.disconnect()

if __name__ == "__main__":
    print("🚀 Comprehensive Voicebot Test Client")
    print("=" * 60)
    print("✨ Features:")
    print("  🎙️  Voice conversation with continuous recording")
    print("  💬 Text queries with TTS responses")
    print("  🔊 Audio playback of TTS responses")
    print("  📊 Real-time statistics and monitoring")
    print("  📜 Conversation history tracking")
    print("  ⚙️  Dynamic configuration (RAG, TTS, Voice, etc.)")
    print("  💾 Optional audio recording to files")
    print("  🎯 Comprehensive message type handling")
    print("  📡 WebSocket health monitoring")
    print("=" * 60)
    
    asyncio.run(main())