import React, { useEffect, useRef, useCallback, useTransition, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Mic,
    MicOff,
    Paperclip,
    X,
    Loader2,
    Sun,
    Moon,
} from "lucide-react";

// Custom hook for auto-resizing textarea
function useAutoResizeTextarea({ minHeight, maxHeight }) {
    const textareaRef = useRef(null);

    const adjustHeight = useCallback(
        (reset) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
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
function useVoiceRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Set up audio analysis for visualization
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            
            analyserRef.current.fftSize = 256;
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            
            const updateAudioLevel = () => {
                if (!analyserRef.current) return;
                
                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setAudioLevel(average / 255);
                
                if (isRecording) {
                    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
                }
            };
            
            mediaRecorderRef.current = new MediaRecorder(stream);
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
        
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        
        setIsRecording(false);
        setAudioLevel(0);
    };

    return {
        isRecording,
        audioLevel,
        startRecording,
        stopRecording
    };
}

// Main chat component
export default function MinimalisticAIChat() {
    const [message, setMessage] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isDark, setIsDark] = useState(true);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 44,
        maxHeight: 120,
    });
    const { isRecording, audioLevel, startRecording, stopRecording } = useVoiceRecorder();

    // Initialize theme
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(savedTheme === 'dark' || (!savedTheme && prefersDark));
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    const handleSend = () => {
        if (message.trim()) {
            startTransition(() => {
                setIsTyping(true);
                setTimeout(() => {
                    setIsTyping(false);
                    setMessage("");
                    adjustHeight(true);
                }, 2000);
            });
        }
    };

    const handleVoiceToggle = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (message.trim()) {
                handleSend();
            }
        }
    };

    const handleAttachFile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '*/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setAttachments(prev => [...prev, file.name]);
            }
        };
        input.click();
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${
                        isDark ? 'bg-blue-400/10' : 'bg-blue-400/5'
                    }`}
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
                <motion.div
                    className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl ${
                        isDark ? 'bg-purple-400/10' : 'bg-purple-400/5'
                    }`}
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [360, 180, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            </div>

            {/* Theme toggle */}
            <motion.button
                onClick={toggleTheme}
                className={`fixed top-6 right-6 p-3 rounded-full transition-all duration-300 z-10 ${
                    isDark 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <AnimatePresence mode="wait">
                    {isDark ? (
                        <motion.div
                            key="sun"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Sun className="w-5 h-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="moon"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Moon className="w-5 h-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Main content */}
            <div className="flex flex-col items-center justify-center min-h-screen p-6">
                <div className="w-full max-w-2xl space-y-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-center space-y-3"
                    >
                        <motion.h1 
                            className={`text-4xl font-light tracking-tight ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            How can I help?
                        </motion.h1>
                        <motion.div
                            className={`h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20`}
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                        <motion.p 
                            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            Ask a question or start a conversation
                        </motion.p>
                    </motion.div>

                    {/* Chat input */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="relative"
                    >
                        <div className={`rounded-2xl border overflow-hidden transition-all duration-300 shadow-lg ${
                            isDark 
                                ? 'bg-gray-800/50 border-gray-700 backdrop-blur-xl focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400/30' 
                                : 'bg-white/80 border-gray-200 backdrop-blur-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30'
                        }`}>
                            {/* Attachments */}
                            <AnimatePresence>
                                {attachments.length > 0 && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                                    >
                                        <div className="flex flex-wrap gap-2">
                                            {attachments.map((file, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                                                        isDark 
                                                            ? 'bg-gray-700 text-gray-300' 
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    <span className="truncate max-w-32">{file}</span>
                                                    <motion.button
                                                        onClick={() => removeAttachment(index)}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className={`transition-colors ${
                                                            isDark 
                                                                ? 'text-gray-400 hover:text-gray-200' 
                                                                : 'text-gray-400 hover:text-gray-600'
                                                        }`}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </motion.button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Input area */}
                            <div className="flex items-end gap-3 p-4">
                                <div className="flex-1">
                                    <textarea
                                        ref={textareaRef}
                                        value={message}
                                        onChange={(e) => {
                                            setMessage(e.target.value);
                                            adjustHeight();
                                        }}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type your message..."
                                        className={`w-full resize-none border-none outline-none bg-transparent text-sm leading-relaxed transition-colors ${
                                            isDark 
                                                ? 'text-white placeholder-gray-400' 
                                                : 'text-gray-900 placeholder-gray-500'
                                        }`}
                                        rows={1}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Attach button */}
                                    <motion.button
                                        onClick={handleAttachFile}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`p-2.5 rounded-xl transition-all duration-200 ${
                                            isDark 
                                                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50' 
                                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Paperclip className="w-4 h-4" />
                                    </motion.button>

                                    {/* Voice button */}
                                    <motion.button
                                        onClick={handleVoiceToggle}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                                            isRecording
                                                ? `text-red-500 ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`
                                                : `${isDark 
                                                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50' 
                                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                                }`
                                        }`}
                                    >
                                        {isRecording ? (
                                            <>
                                                <motion.div
                                                    className="absolute inset-0 rounded-xl bg-red-500/20"
                                                    animate={{
                                                        scale: [1, 1 + audioLevel * 0.3],
                                                        opacity: [0.3, 0.6],
                                                    }}
                                                    transition={{
                                                        duration: 0.1,
                                                        ease: "easeOut",
                                                    }}
                                                />
                                                <motion.div
                                                    className="absolute inset-0 rounded-xl border-2 border-red-500/50"
                                                    animate={{
                                                        scale: [1, 1.2],
                                                        opacity: [0.5, 0],
                                                    }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                        ease: "easeOut",
                                                    }}
                                                />
                                                <MicOff className="w-4 h-4 relative z-10" />
                                            </>
                                        ) : (
                                            <Mic className="w-4 h-4" />
                                        )}
                                    </motion.button>

                                    {/* Send button */}
                                    <motion.button
                                        onClick={handleSend}
                                        disabled={!message.trim() || isTyping}
                                        whileHover={message.trim() ? { scale: 1.05 } : {}}
                                        whileTap={message.trim() ? { scale: 0.95 } : {}}
                                        className={`p-2.5 rounded-xl transition-all duration-200 ${
                                            message.trim()
                                                ? "text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                                                : `${isDark 
                                                    ? 'text-gray-400 bg-gray-700/50' 
                                                    : 'text-gray-400 bg-gray-100'
                                                }`
                                        }`}
                                    >
                                        {isTyping ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="flex flex-wrap justify-center gap-3"
                    >
                        {[
                            { label: "Summarize", icon: "📝" },
                            { label: "Translate", icon: "🌐" },
                            { label: "Explain", icon: "💡" },
                            { label: "Code", icon: "💻" },
                        ].map((action, index) => (
                            <motion.button
                                key={action.label}
                                onClick={() => {
                                    setMessage(action.label + " ");
                                    textareaRef.current?.focus();
                                }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-all duration-200 border ${
                                    isDark 
                                        ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border-gray-700 hover:border-gray-600' 
                                        : 'bg-white/80 hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                                } backdrop-blur-sm`}
                            >
                                <span className="text-base">{action.icon}</span>
                                {action.label}
                            </motion.button>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Typing indicator */}
            <AnimatePresence>
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
                    >
                        <div className={`rounded-2xl px-4 py-3 shadow-lg border backdrop-blur-xl ${
                            isDark 
                                ? 'bg-gray-800/90 border-gray-700' 
                                : 'bg-white/90 border-gray-200'
                        }`}>
                            <div className="flex items-center gap-3">
                                <motion.div
                                    className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                    }}
                                >
                                    AI
                                </motion.div>
                                <div className={`flex items-center gap-2 text-sm ${
                                    isDark ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                    <span>Thinking</span>
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                                                animate={{
                                                    scale: [1, 1.5, 1],
                                                    opacity: [0.5, 1, 0.5],
                                                }}
                                                transition={{
                                                    duration: 1.2,
                                                    repeat: Infinity,
                                                    delay: i * 0.2,
                                                    ease: "easeInOut",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recording indicator */}
            <AnimatePresence>
                {isRecording && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
                    >
                        <div className="relative">
                            <motion.div
                                className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl"
                                animate={{
                                    scale: [1, 1 + audioLevel * 0.3],
                                }}
                                transition={{
                                    duration: 0.1,
                                    ease: "easeOut",
                                }}
                            >
                                <Mic className="w-10 h-10 text-white" />
                            </motion.div>
                            
                            {/* Pulsing rings */}
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="absolute inset-0 border-2 border-red-500 rounded-full"
                                    animate={{
                                        scale: [1, 2.5],
                                        opacity: [0.6, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.6,
                                        ease: "easeOut",
                                    }}
                                />
                            ))}
                            
                            {/* Glowing effect */}
                            <motion.div
                                className="absolute inset-0 rounded-full bg-red-500/20 blur-xl"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        </div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mt-6"
                        >
                            <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Listening...
                            </p>
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Tap the mic to stop recording
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recording overlay */}
            <AnimatePresence>
                {isRecording && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-40 ${isDark ? 'bg-black/50' : 'bg-white/50'} backdrop-blur-sm`}
                        onClick={handleVoiceToggle}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}