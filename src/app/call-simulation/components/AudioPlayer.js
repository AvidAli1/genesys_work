'use client';
import { useState, useEffect, useRef } from "react";

const AudioPlayer = ({ chunks }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentChunk, setCurrentChunk] = useState(0);
    
    const audioContextRef = useRef(null);
    const sourceRef = useRef(null);
    const audioBuffersRef = useRef([]);
    const startTimeRef = useRef(0);
    const progressIntervalRef = useRef(null);

    // Initialize audio context
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        return () => {
            stopAudio();
            if (audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Decode chunks as they arrive
    useEffect(() => {
        const decodeChunks = async () => {
            if (!chunks || chunks.length === 0) return;
            
            // Only decode new chunks we haven't processed yet
            const startIndex = audioBuffersRef.current.length;
            for (let i = startIndex; i < chunks.length; i++) {
                try {
                    const arrayBuffer = base64ToArrayBuffer(chunks[i].base64);
                    const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
                    audioBuffersRef.current[i] = buffer;
                } catch (error) {
                    console.error(`Error decoding chunk ${i}:`, error);
                    audioBuffersRef.current[i] = null;
                }
            }
        };

        decodeChunks();
    }, [chunks]);

    const base64ToArrayBuffer = (base64) => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    const stopAudio = () => {
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current = null;
        }
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    };

    const playChunk = (index) => {
        if (!audioBuffersRef.current[index]) return;
        
        stopAudio();
        
        // Create new source
        sourceRef.current = audioContextRef.current.createBufferSource();
        sourceRef.current.buffer = audioBuffersRef.current[index];
        sourceRef.current.connect(audioContextRef.current.destination);
        
        // Set up playback tracking
        startTimeRef.current = Date.now();
        const duration = audioBuffersRef.current[index].duration * 1000;
        
        sourceRef.current.onended = () => {
            // Move to next chunk if available
            if (index < audioBuffersRef.current.length - 1) {
                setCurrentChunk(index + 1);
                playChunk(index + 1);
            } else {
                setIsPlaying(false);
                setProgress(100);
            }
        };
        
        // Start playback
        sourceRef.current.start(0);
        setIsPlaying(true);
        setCurrentChunk(index);
        
        // Update progress
        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            setProgress(Math.min(100, (elapsed / duration) * 100));
        }, 50);
    };

    const togglePlayback = () => {
        if (isPlaying) {
            stopAudio();
            setIsPlaying(false);
        } else {
            playChunk(currentChunk);
        }
    };

    const replayFromStart = () => {
        stopAudio();
        setCurrentChunk(0);
        playChunk(0);
    };

    return (
        <div className="flex items-center p-3 bg-gray-100 rounded-lg mt-2">
            <div className="flex items-center">
                <button 
                    onClick={togglePlayback}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white"
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
                <button 
                    onClick={replayFromStart}
                    className="ml-2 w-8 h-8 rounded-full flex items-center justify-center bg-gray-300 hover:bg-gray-400"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z" />
                    </svg>
                </button>
            </div>
            <div className="ml-3 flex-1">
                <div className="text-xs text-gray-600 mb-1">
                    {chunks?.length > 0 && `Chunk ${currentChunk + 1}/${chunks.length}`}
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                    <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;