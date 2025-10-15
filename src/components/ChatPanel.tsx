"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useUser } from '@clerk/nextjs';

interface ChatPanelProps {
  conversationId: string;
  currentUserId: string;
  onMessageSent?: () => void;
}

export default function ChatPanel({ conversationId, currentUserId, onMessageSent }: ChatPanelProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const { user: clerkUser } = useUser();
  const myId = currentUserId || clerkUser?.id || '';

  const scrollToBottom = () => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      const res = await fetch(`/api/conversations/${conversationId}`);
      const data = await res.json();
      if (mounted && data.success) {
        setConversation(data.conversation);
        setMessages(data.messages || []);
        setTimeout(scrollToBottom, 0);
        fetch(`/api/conversations/${conversationId}/read`, { method: 'PATCH' });
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [conversationId]);

  useEffect(() => {
    const socket = io(baseUrl, { path: '/socket.io/' });
    if (myId) {
      socket.emit('register_user', myId);
      socket.emit('join_conversation', { conversationId, userId: myId });
    }
    socket.on('new_message', (msg: any) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(scrollToBottom, 0);
    });
    return () => {
      socket.emit('leave_conversation', conversationId);
      socket.disconnect();
    };
  }, [baseUrl, conversationId, myId]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.trim() })
      });
      if (res.ok) {
        setInput('');
        // Notify parent to refresh conversation list
        if (onMessageSent) onMessageSent();
      }
    } finally {
      setSending(false);
    }
  };

  const other = useMemo(() => {
    if (!conversation) return null;
    return (conversation.participants || []).find((p: any) => String(p.userId) !== myId);
  }, [conversation, myId]);

  const getInitial = (name?: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const renderAvatar = (imageUrl?: string, name?: string, size: string = 'w-8 h-8') => {
    if (imageUrl && imageUrl !== '/default-avatar.png') {
      return (
        <img 
          src={imageUrl} 
          alt={name || 'User'} 
          className={`${size} rounded-full object-cover`}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<div class="${size} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">${getInitial(name)}</div>`;
            }
          }}
        />
      );
    }
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm`}>
        {getInitial(name)}
      </div>
    );
  };

  return (
    <div className="h-[70vh] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border dark:border-gray-700 flex flex-col">
      <div className="p-3 border-b dark:border-gray-700 flex items-center gap-3">
        {renderAvatar(other?.profile?.imageUrl, other?.profile?.name, 'w-8 h-8')}
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{other?.profile?.name || 'Conversation'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Case chat</p>
        </div>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
        {messages.map((m, idx) => {
          const mine = myId && String(m.senderId) === String(myId);
          return (
            <div key={m._id || idx} className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
              {!mine && renderAvatar(other?.profile?.imageUrl, other?.profile?.name, 'w-6 h-6')}
              <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${mine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border dark:border-gray-600 rounded-bl-none'}`}>
                <div className="text-sm whitespace-pre-wrap break-words">{m.content}</div>
                <div className={`text-[10px] mt-1 ${mine ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>{new Date(m.createdAt || Date.now()).toLocaleTimeString()}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t dark:border-gray-700 flex gap-2 bg-white dark:bg-gray-800">
        <input value={input} onChange={(e)=>setInput(e.target.value)} maxLength={2000} placeholder="Type a message..." className="flex-1 px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        <button onClick={handleSend} disabled={sending || !input.trim()} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-400">Send</button>
      </div>
    </div>
  );
}
