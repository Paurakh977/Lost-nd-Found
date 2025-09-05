"use client";
import React, { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Mic,
    MicOff,
    Paperclip,
    X,
    Loader2,
    Trash2,
    Play,
    Pause,
} from "lucide-react";
import { useTheme } from "../../components/ThemeProvider";
import FloatingParticles from "../../components/ui/FloatingParticles";

// Custom hook for auto-resizing textarea
function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number, maxHeight?: number }) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = 'auto';
            const newHeight = Math.max(
                minHeight,
                Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
            );
            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    return { textareaRef, adjustHeight };
}

// Voice recorder hook
function useVoiceRecorder({ onStop }: { onStop: (audioBlob: Blob) => void }) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            
            analyserRef.current.fftSize = 256;
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            
            const updateAudioLevel = () => {
                if (!analyserRef.current || !mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
                    if(animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                    return;
                }
                
                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setAudioLevel(average / 255);
                
                animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
            };
            
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                onStop(audioBlob);
                
                stream.getTracks().forEach(track => track.stop());
                if (audioContextRef.current?.state !== 'closed') {
                    audioContextRef.current?.close();
                }
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
                setIsRecording(false);
                setAudioLevel(0);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            updateAudioLevel();
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    useEffect(() => {
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    return { isRecording, audioLevel, startRecording, stopRecording };
}

// Audio player for preview
const AudioPreview = ({ audioUrl, onDiscard }: { audioUrl: string, onDiscard: () => void }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (audio.duration > 0) setProgress((audio.currentTime / audio.duration) * 100);
        };
        const handlePlaybackEnd = () => {
            setIsPlaying(false);
            setProgress(0);
            if(audio) audio.currentTime = 0;
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handlePlaybackEnd);
        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handlePlaybackEnd);
        };
    }, [audioUrl]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) audio.pause();
        else audio.play();
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex items-center gap-3 w-full p-2 bg-gray-500/10 rounded-lg">
            <audio ref={audioRef} src={audioUrl} preload="auto" />
            <motion.button onClick={togglePlay} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full bg-blue-500/20 text-blue-500">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </motion.button>
            <div className="flex-1 h-1.5 bg-gray-500/20 rounded-full overflow-hidden">
                <motion.div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
            </div>
            <motion.button onClick={onDiscard} whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9, rotate: -5 }} className="p-2 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
            </motion.button>
        </div>
    );
};

// Main chat component
export default function AgenticSearchPage() {
    const [message, setMessage] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [audioPreview, setAudioPreview] = useState<{ url: string, blob: Blob } | null>(null);
    const [isSending, setIsSending] = useState(false);
    const { isDark, mounted } = useTheme();

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 48, maxHeight: 200 });

    const handleRecordingStop = (audioBlob: Blob) => {
        const url = URL.createObjectURL(audioBlob);
        setAudioPreview({ url, blob: audioBlob });
    };

    const { isRecording, audioLevel, startRecording, stopRecording } = useVoiceRecorder({ onStop: handleRecordingStop });

    const handleSend = () => {
        if (isSending || (!message.trim() && attachments.length === 0 && !audioPreview)) return;
        
        setIsSending(true);
        console.log("Sending:", { message, attachments, audio: audioPreview?.blob });
        
        setTimeout(() => {
            setIsSending(false);
            setMessage("");
            setAttachments([]);
            if (audioPreview) {
                URL.revokeObjectURL(audioPreview.url);
                setAudioPreview(null);
            }
            adjustHeight(true);
        }, 2000);
    };

    const handleVoiceToggle = () => {
        if (isRecording) {
            stopRecording();
        } else {
            setMessage("");
            setAttachments([]);
            if (audioPreview) URL.revokeObjectURL(audioPreview.url);
            setAudioPreview(null);
            startRecording();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setAttachments(prev => [...prev, ...Array.from(files)]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const discardAudio = () => {
        if (audioPreview) URL.revokeObjectURL(audioPreview.url);
        setAudioPreview(null);
    };

    if (!mounted) {
        return <div className="min-h-screen bg-white dark:bg-black" />;
    }

    return (
        <div className={`relative min-h-screen w-full overflow-hidden transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
            <FloatingParticles count={isDark ? 20 : 15} />
            
            {/* Background Glow Effects */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div 
                        className={`absolute w-[50vw] h-[50vh] rounded-full blur-[120px] ${
                            isDark ? 'bg-purple-500/30' : 'bg-purple-300/40'
                        }`}
                        initial={{ x: '10vw', y: '10vh' }}
                        animate={{ x: '30vw', y: '40vh' }}
                        transition={{ duration: 20, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                    />
                    <motion.div 
                        className={`absolute w-[40vw] h-[60vh] rounded-full blur-[120px] ${
                            isDark ? 'bg-blue-500/30' : 'bg-blue-300/40'
                        }`}
                        initial={{ x: '80vw', y: '20vh' }}
                        animate={{ x: '50vw', y: '60vh' }}
                        transition={{ duration: 25, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                    />
                </div>
                <motion.div 
                    className={`absolute top-1/2 left-0 w-full h-px ${
                        isDark ? 'bg-gradient-to-r from-transparent via-blue-400/50 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-500/40 to-transparent'
                    }`}
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 15, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                />
            </div>

            <div className="relative z-10 flex flex-col justify-between min-h-screen w-full mx-auto max-w-3xl p-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="text-center pt-10 sm:pt-20"
                >
                    <h1 className={`text-4xl md:text-5xl font-light tracking-tight ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                        What did you lose or find?
                    </h1>
                    <p className={`mt-4 text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Describe the item in detail. The more information, the better.
                    </p>
                </motion.div>

                {/* Chat Input Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
                    className="w-full pb-4"
                >
                    <div className={`w-full rounded-2xl border overflow-hidden transition-all duration-300 shadow-2xl shadow-black/10 ${
                        isDark 
                            ? 'bg-gray-900/50 border-gray-700/50 backdrop-blur-xl focus-within:border-blue-400/80 focus-within:ring-2 focus-within:ring-blue-400/40' 
                            : 'bg-white/70 border-gray-200/80 backdrop-blur-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/40'
                    }`}>
                        
                        <AnimatePresence>
                            {attachments.length > 0 && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={`p-3 border-b ${isDark ? 'border-gray-700/50' : 'border-gray-200'}`}>
                                    <div className="flex flex-wrap gap-2">
                                        {attachments.map((file, index) => (
                                            <motion.div key={index} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.2, delay: index * 0.05 }} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                                <span className="truncate max-w-32">{file.name}</span>
                                                <motion.button onClick={() => removeAttachment(index)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'}`}>
                                                    <X className="w-3 h-3" />
                                                </motion.button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-end gap-2 sm:gap-3 p-2 sm:p-3">
                            {audioPreview ? (
                                <AudioPreview audioUrl={audioPreview.url} onDiscard={discardAudio} />
                            ) : (
                                <textarea
                                    ref={textareaRef}
                                    value={message}
                                    onChange={(e) => { setMessage(e.target.value); adjustHeight(); }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Describe your item or start with a voice message..."
                                    className={`flex-1 w-full resize-none border-none outline-none bg-transparent text-base leading-relaxed transition-colors ${isDark ? 'text-gray-200 placeholder-gray-500' : 'text-gray-800 placeholder-gray-500'} disabled:opacity-70`}
                                    rows={1}
                                    disabled={isRecording}
                                />
                            )}

                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                {!audioPreview && !isRecording && (
                                    <label className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}>
                                        <Paperclip className="w-5 h-5" />
                                        <input type="file" multiple onChange={handleAttachFile} className="hidden" />
                                    </label>
                                )}

                                <motion.button
                                    onClick={handleVoiceToggle}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`relative p-3 rounded-xl transition-all duration-200 ${isRecording ? `text-red-400 ${isDark ? 'bg-red-900/30' : 'bg-red-100'}` : `${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}`}
                                >
                                    {isRecording ? (
                                        <>
                                            <MicOff className="w-5 h-5 relative z-10" />
                                            <motion.div className="absolute inset-0 rounded-xl bg-red-500/20" animate={{ scale: [1, 1 + audioLevel * 0.4], opacity: [0.3, 0.7] }} transition={{ duration: 0.1, ease: "easeOut" }} />
                                            <motion.div className="absolute inset-0 rounded-xl border-2 border-red-500/50" animate={{ scale: [1, 1.4], opacity: [0.5, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }} />
                                        </>
                                    ) : (
                                        <Mic className="w-5 h-5" />
                                    )}
                                </motion.button>

                                <motion.button
                                    onClick={handleSend}
                                    disabled={(!message.trim() && attachments.length === 0 && !audioPreview) || isSending}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative flex items-center justify-center p-3 rounded-xl transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none group"
                                >
                                    <span className={`absolute inset-0 transition-all duration-300 ${(!message.trim() && attachments.length === 0 && !audioPreview) ? (isDark ? 'bg-gray-800/60' : 'bg-gray-200') : 'bg-gradient-to-r from-zinc-800 via-zinc-900 to-black'}`} />
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        animate={{ x: ['-150%', '150%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                    <div className="relative z-10 flex items-center gap-1 text-white">
                                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </div>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {isSending && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} transition={{ duration: 0.4, ease: "easeInOut" }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
                        <div className={`rounded-2xl px-4 py-3 shadow-lg border backdrop-blur-xl ${isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <motion.div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                                    AI
                                </motion.div>
                                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <span>Searching...</span>
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
