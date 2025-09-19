"use client";
// page.tsx
import React, { useEffect, useRef, useCallback, useState, useMemo } from "react";
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
    User as UserIcon,
    Bot as BotIcon,
} from "lucide-react";
import { useTheme } from "../../components/ThemeProvider";
import FloatingParticles from "../../components/ui/FloatingParticles";

// Types
type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
    attachments?: string[];
    audioUrl?: string;
};

// Helpers
async function blobToBase64(blob: Blob): Promise<string> {
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1] || result; // handle data URL
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

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
function useVoiceRecorder({ onStop }: { onStop?: (audioBlob: Blob) => void }) {
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
                if (onStop) onStop(audioBlob);
                stream.getTracks().forEach(track => track.stop());
                if (audioContextRef.current) {
                    audioContextRef.current.close();
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
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
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

// Minimalistic Audio player for preview
const AudioPreview = ({ audioUrl, onDiscard }: { audioUrl: string, onDiscard: () => void }) => {
    const { isDark } = useTheme();
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

    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) audio.pause();
        else audio.play();
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-2 w-full p-2 rounded-lg ${
                isDark ? 'bg-neutral-800/50 border border-neutral-700/50' : 'bg-neutral-100/80 border border-neutral-200/60'
            }`}
        >
            <audio ref={audioRef} src={audioUrl} preload="auto" />
            <motion.button 
                onClick={togglePlay} 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isDark 
                        ? 'bg-neutral-700/60 text-neutral-300 hover:bg-neutral-600/60' 
                        : 'bg-neutral-200/80 text-neutral-600 hover:bg-neutral-300/80'
                }`}
            >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </motion.button>
            <div className={`flex-1 h-0.5 rounded-full overflow-hidden ${
                isDark ? 'bg-neutral-700/60' : 'bg-neutral-300/60'
            }`}>
                <motion.div 
                    className={`h-full ${isDark ? 'bg-neutral-400' : 'bg-neutral-600'}`}
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>
            <motion.button 
                onClick={onDiscard} 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isDark 
                        ? 'text-neutral-500 hover:text-red-400 hover:bg-red-500/10' 
                        : 'text-neutral-400 hover:text-red-500 hover:bg-red-500/10'
                }`}
            >
                <Trash2 className="w-3 h-3" />
            </motion.button>
        </motion.div>
    );
};

// Recording indicator component
const RecordingIndicator = ({ onStop, audioLevel }: { onStop: () => void, audioLevel: number }) => {
    const { isDark } = useTheme();
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 z-40 ${isDark ? 'bg-black/40' : 'bg-white/40'} backdrop-blur-sm`}
                onClick={onStop}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex flex-col items-center"
                >
                    <div className="relative">
                        <motion.button
                            onClick={onStop}
                            className="relative w-12 h-12 bg-red-500 rounded-full flex items-center justify-center cursor-pointer shadow-2xl"
                            animate={{
                                scale: [1, 1 + audioLevel * 0.15],
                                boxShadow: [
                                    '0 0 20px rgba(239, 68, 68, 0.4)',
                                    `0 0 ${30 + audioLevel * 20}px rgba(239, 68, 68, ${0.6 + audioLevel * 0.3})`
                                ]
                            }}
                            transition={{ duration: 0.1, ease: "easeOut" }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Mic className="w-4 h-4 text-white" />
                        </motion.button>
                        {[0, 1, 2, 3, 4].map((i) => (
                            <motion.div
                                key={i}
                                className="absolute inset-0 border-2 border-red-400/60 rounded-full pointer-events-none"
                                style={{
                                    width: `${100 + (i + 1) * 15}%`,
                                    height: `${100 + (i + 1) * 15}%`,
                                    left: `${-(i + 1) * 7.5}%`,
                                    top: `${-(i + 1) * 7.5}%`,
                                }}
                                animate={{
                                    scale: [1, 1.8],
                                    opacity: [0.8, 0],
                                    borderWidth: [2, 0]
                                }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeOut" }}
                            />
                        ))}
                        <motion.div
                            className="absolute inset-0 bg-red-500/30 rounded-full blur-lg pointer-events-none"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute inset-0 bg-red-400/20 rounded-full blur-xl pointer-events-none"
                            animate={{ scale: [1.2, 1.2 + audioLevel * 0.8], opacity: [0.3, 0.3 + audioLevel * 0.5] }}
                            transition={{ duration: 0.1, ease: "easeOut" }}
                        />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center mt-6 px-4"
                    >
                        <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Listening...</p>
                        <p className={`text-sm mt-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Tap the mic or anywhere to stop recording</p>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
};

// Main chat component
export default function AgenticSearchPage() {
    const [message, setMessage] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
    const [audioPreview, setAudioPreview] = useState<{ url: string, blob: Blob } | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [chat, setChat] = useState<ChatMessage[]>([]);
    // Remove reliance on /api/auth/me for Clerk users; server proxy injects identity
    const [userInfo] = useState<{ id: string; firstName?: string; lastName?: string } | null>(null);
    const { isDark, mounted } = useTheme();

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 48, maxHeight: 200 });

    // No client auth fetch; access is already enforced by middleware and proxy

    const handleRecordingStop = (audioBlob: Blob) => {
        const url = URL.createObjectURL(audioBlob);
        setAudioPreview({ url, blob: audioBlob });
    };

    const { isRecording, audioLevel, startRecording, stopRecording } = useVoiceRecorder({ onStop: handleRecordingStop });

    const sendToAgent = useCallback(async () => {
        if (!message.trim() && attachments.length === 0 && !audioPreview) return;
        setIsSending(true);

        let mime = "text/plain";
        let data = message.trim();
        const body: any = { mime_type: mime, data };

        if (audioPreview) {
            const base64 = await blobToBase64(audioPreview.blob);
            body.mime_type = 'audio/webm';
            body.data = base64;
        }

        if (attachments.length > 0) {
            const attPayload = await Promise.all(
                attachments.map(async (file) => ({
                    mime_type: file.type,
                    data: await fileToBase64(file),
                }))
            );
            body.attachments = attPayload;
        }

        const userMessageText = audioPreview ? "" : (message.trim() || (attachments.length > 0 ? "[Attachments]" : ""));
        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: userMessageText,
            attachments: attachmentPreviews.length ? [...attachmentPreviews] : undefined,
            audioUrl: audioPreview ? audioPreview.url : undefined,
        };
        setChat((prev) => [...prev, userMsg]);

        // Clear UI immediately
        setMessage("");
        setAttachments([]);
        // Do not revoke attachmentPreviews here because they are shown in the chat bubble
        setAttachmentPreviews([]);
        if (audioPreview) {
            // keep URL for bubble; will be released on refresh/navigation
            setAudioPreview(null);
        }
        
        // Reset textarea height after clearing message
        setTimeout(() => {
            adjustHeight(true);
            if (textareaRef.current) {
                textareaRef.current.value = "";
            }
        }, 0);

        try {
            const res = await fetch(`/api/agent/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            const text = json?.response_text || json?.error || "No response";
            const botMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: text };
            setChat((prev) => [...prev, botMsg]);
        } catch (e) {
            const botMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: "Failed to reach agent server." };
            setChat((prev) => [...prev, botMsg]);
        } finally {
            setIsSending(false);
        }
    }, [message, attachments, audioPreview, attachmentPreviews, adjustHeight]);

    const handleSend = () => {
        sendToAgent();
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
            const newFiles = Array.from(files);
            setAttachments(prev => [...prev, ...newFiles]);
            const urls = newFiles.map(f => URL.createObjectURL(f));
            setAttachmentPreviews(prev => [...prev, ...urls]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
        setAttachmentPreviews(prev => {
            const url = prev[index];
            if (url) URL.revokeObjectURL(url);
            return prev.filter((_, i) => i !== index);
        });
    };

    const discardAudio = () => {
        if (audioPreview) URL.revokeObjectURL(audioPreview.url);
        setAudioPreview(null);
    };

    if (!mounted) {
        return <div className="min-h-screen bg-white dark:bg-black" />;
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`relative min-h-screen w-full overflow-hidden transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-gray-50'}`}
        >
            <FloatingParticles count={isDark ? 20 : 15} />
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 overflow-hidden">
                    <div 
                        className={`absolute w-[35vw] h-[35vh] rounded-full blur-[120px] ${
                            isDark ? 'bg-purple-500/8' : 'bg-purple-300/12'
                        }`}
                        style={{ left: '15%', top: '15%' }}
                    />
                    <div 
                        className={`absolute w-[30vw] h-[40vh] rounded-full blur-[120px] ${
                            isDark ? 'bg-blue-500/8' : 'bg-blue-300/12'
                        }`}
                        style={{ right: '15%', top: '20%' }}
                    />
                    <div 
                        className={`absolute w-[25vw] h-[30vh] rounded-full blur-[100px] ${
                            isDark ? 'bg-indigo-500/6' : 'bg-indigo-300/10'
                        }`}
                        style={{ right: '20%', bottom: '25%' }}
                    />
                    <div 
                        className={`absolute w-[20vw] h-[25vh] rounded-full blur-[80px] ${
                            isDark ? 'bg-cyan-500/6' : 'bg-cyan-300/10'
                        }`}
                        style={{ left: '20%', bottom: '30%' }}
                    />
                </div>
                <div 
                    className={`absolute top-1/2 left-0 w-full h-px ${
                        isDark ? 'bg-gradient-to-r from-transparent via-blue-400/15 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-500/12 to-transparent'
                    }`}
                    style={{ top: '50%' }}
                />
            </div>

            <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.2, delayChildren: 0.3 }
                    }
                }}
                className="relative z-20 flex flex-col min-h-screen w-full mx-auto max-w-3xl p-4 overflow-x-hidden"
            >
                <motion.div
                    variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } } }}
                    className="text-center pt-10 sm:pt-20"
                >
                    <h1 className={`text-4xl md:text-5xl font-light tracking-tight ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                        What did you lose or find?
                    </h1>
                    <p className={`mt-4 text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Describe the item in detail. The more information, the better.
                    </p>
                    <motion.div 
                        className="relative mx-auto mt-8 w-full max-w-md overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    >
                        <motion.div
                            className={`h-px bg-gradient-to-r from-transparent ${isDark ? 'via-blue-400/70' : 'via-blue-500/60'} to-transparent`}
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                        />
                        <motion.div 
                            className={`absolute inset-0 h-px bg-gradient-to-r from-transparent ${isDark ? 'via-purple-400/50' : 'via-purple-500/40'} to-transparent blur-sm`}
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </motion.div>
                </motion.div>

                {/* Conversation */}
                <div className="flex-1 mt-6 mb-4 overflow-y-auto overflow-x-hidden space-y-5">
                    {chat.map((m) => (
                        <motion.div 
                            key={m.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div 
                                className={`relative max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                                    m.role === 'user'
                                        ? (isDark 
                                            ? 'bg-gradient-to-br from-indigo-900/40 to-purple-900/40 text-neutral-50 backdrop-blur-md' 
                                            : 'bg-gradient-to-br from-white to-purple-50/30 border border-purple-100/40 text-neutral-800')
                                        : (isDark 
                                            ? 'bg-neutral-900/30 text-neutral-50 backdrop-blur-md' 
                                            : 'bg-white/90 text-neutral-800 backdrop-blur-md')
                                }`}
                                style={{
    boxShadow: m.role === 'user'
        ? (isDark 
            ? '0 4px 12px -2px rgba(124, 58, 237, 0.25), inset 0 0 0 0.5px rgba(139, 92, 246, 0.3)' 
            : '0 12px 24px -6px rgba(0, 0, 0, 0.15), 0 4px 10px -3px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.02)')
        : (isDark 
            ? '0 4px 12px -2px rgba(0, 0, 0, 0.3), inset 0 0 0 0.5px rgba(255, 255, 255, 0.08)' 
            : '0 16px 32px -8px rgba(0, 0, 0, 0.12), 0 4px 12px -3px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)')
}}
                            >
                                {/* Glow effect for dark mode */}
                                {isDark && (
                                    <>
                                        <div className={`absolute inset-0 rounded-2xl opacity-40 blur-xl -z-10 ${
                                            m.role === 'user' 
                                                ? 'bg-purple-600/25' 
                                                : 'bg-blue-600/15'
                                        }`} />
                                        <div className={`absolute -inset-1 rounded-3xl opacity-20 blur-2xl -z-20 ${
                                            m.role === 'user' 
                                                ? 'bg-purple-500/20' 
                                                : 'bg-blue-500/10'
                                        }`} />
                                    </>
                                )}
                                
                                {/* Subtle gradient border */}
                                <div className={`absolute inset-0 rounded-2xl -z-5 ${
                                    m.role === 'user'
                                        ? (isDark 
                                            ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10' 
                                            : 'bg-gradient-to-br from-zinc-700/5 to-zinc-900/5')
                                        : (isDark 
                                            ? 'bg-gradient-to-br from-neutral-700/10 to-neutral-800/10' 
                                            : 'bg-gradient-to-br from-neutral-200/30 to-neutral-300/30')
                                }`} style={{
                                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                    maskComposite: 'xor',
                                    maskBorder: '1px',
                                    WebkitMaskComposite: 'xor',
                                    padding: '1px'
                                }} />
                                
                                <div className={`flex items-center gap-2 mb-2 text-xs font-medium ${
                                    m.role === 'user' 
                                        ? (isDark ? 'text-indigo-300' : 'text-indigo-100')
                                        : (isDark ? 'text-blue-300' : 'text-blue-500')
                                }`}>
                                    {m.role === 'user' 
                                        ? <UserIcon className="w-3 h-3" /> 
                                        : <BotIcon className="w-3 h-3" />
                                    }
                                    <span>{m.role === 'user' ? 'You' : 'Agent'}</span>
                                </div>
                                
                                {m.attachments && m.attachments.length > 0 && (
                                    <div className="mb-3 grid grid-cols-2 gap-2">
                                        {m.attachments.map((url, idx) => (
                                            <motion.img 
                                                key={idx} 
                                                src={url} 
                                                className="w-full h-24 object-cover rounded-xl border border-neutral-200/20" 
                                                alt="sent attachment"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.2, delay: idx * 0.1 }}
                                            />
                                        ))}
                                    </div>
                                )}
                                
                                {m.audioUrl && (
                                    <div className="mb-3">
                                        <div className={`flex items-center gap-2 p-2 rounded-lg ${
                                            isDark 
                                                ? 'bg-neutral-800/40 backdrop-blur-md' 
                                                : 'bg-neutral-100/70 backdrop-blur-md'
                                        }`} style={{
                                            boxShadow: isDark 
                                                ? 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.1)' 
                                                : 'inset 0 0 0 0.5px rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                isDark ? 'bg-neutral-700/60' : 'bg-neutral-200/80'
                                            }`}>
                                                <Mic className={`w-3 h-3 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`} />
                                            </div>
                                            <span className={`text-xs font-medium ${
                                                isDark ? 'text-neutral-300' : 'text-neutral-600'
                                            }`}>Voice message</span>
                                            <audio controls src={m.audioUrl} className="flex-1 h-6" style={{ filter: isDark ? 'invert(0.8)' : 'invert(0.2)' }} />
                                        </div>
                                    </div>
                                )}
                                
                                {m.content?.trim() ? (
                                    <div className="whitespace-pre-wrap">{m.content}</div>
                                ) : null}
                                
                                {/* Subtle animated highlight for dark mode */}
                                {isDark && m.role === 'user' && (
                                    <motion.div 
                                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0"
                                        animate={{ 
                                            opacity: [0, 0.5, 0],
                                            x: ['-100%', '200%', '200%']
                                        }}
                                        transition={{ 
                                            duration: 3, 
                                            repeat: Infinity, 
                                            repeatDelay: 5,
                                            ease: "easeInOut" 
                                        }}
                                    />
                                )}
                                
                                {/* Subtle animated highlight for assistant in dark mode */}
                                {isDark && m.role === 'assistant' && (
                                    <motion.div 
                                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0"
                                        animate={{ 
                                            opacity: [0, 0.5, 0],
                                            x: ['-100%', '200%', '200%']
                                        }}
                                        transition={{ 
                                            duration: 3, 
                                            repeat: Infinity, 
                                            repeatDelay: 7,
                                            ease: "easeInOut" 
                                        }}
                                    />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Chat Input Section */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } } }}
                    className="w-full pb-4"
                >
                    <div className={`w-full rounded-2xl border overflow-hidden transition-all duration-300 shadow-lg ${
                        isDark 
                            ? 'bg-gray-900/40 border-gray-800/40 backdrop-blur-xl focus-within:border-blue-400/60 focus-within:ring-1 focus-within:ring-blue-400/30' 
                            : 'bg-white/60 border-gray-200/60 backdrop-blur-xl focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/30'
                    }`}>
                        <AnimatePresence>
                            {attachments.length > 0 && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={`p-3 border-b ${isDark ? 'border-gray-700/50' : 'border-gray-200'}`}>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {attachments.map((file, index) => (
                                            <motion.div key={index} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.15 }} className={`relative group rounded-xl overflow-hidden ${isDark ? 'bg-gray-800/60' : 'bg-gray-100'}`}>
                                                {file.type.startsWith('image/') && attachmentPreviews[index] ? (
                                                    <img src={attachmentPreviews[index]} alt={file.name} className="w-full h-20 object-cover" />
                                                ) : (
                                                    <div className="h-20 flex items-center justify-center text-xs px-2 truncate">
                                                        {file.name}
                                                    </div>
                                                )}
                                                <button onClick={() => removeAttachment(index)} className={`absolute top-1 right-1 rounded-full p-1 ${isDark ? 'bg-black/50 text-white/80 hover:bg-black/70' : 'bg-white/70 text-gray-700 hover:bg-white'}`}>
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
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
            </motion.div>

            <AnimatePresence>
                {isSending && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} 
                        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-30"
                    >
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm shadow-lg ${
                            isDark ? 'bg-gray-900/80 text-white/90 border border-gray-700/50' : 'bg-white/90 text-gray-700 border border-gray-200/60'
                        } backdrop-blur-md`}>
                            <motion.div 
                                className={`w-2 h-2 rounded-full ${
                                    isDark ? 'bg-blue-400' : 'bg-blue-500'
                                }`}
                                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} 
                                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <span className="font-medium">AI thinking...</span>
                        </div>
                    </motion.div>
                )}
                {isRecording && <RecordingIndicator onStop={stopRecording} audioLevel={audioLevel} />}
            </AnimatePresence>
        </motion.div>
    );
}
