"use client";

import React, { useEffect, useMemo, useState } from 'react';
import ChatPanel from '../../../components/ChatPanel';

export default function OfficerMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const getInitial = (name?: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const renderAvatar = (imageUrl?: string, name?: string) => {
    if (imageUrl && imageUrl !== '/default-avatar.png') {
      return (
        <img 
          src={imageUrl} 
          alt={name || 'User'} 
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">${getInitial(name)}</div>`;
            }
          }}
        />
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
        {getInitial(name)}
      </div>
    );
  };

  useEffect(() => {
    // Determine current user id (JWT or Clerk)
    const getMe = async () => {
      try {
        const jwtRes = await fetch('/api/auth/me');
        if (jwtRes.ok) {
          const data = await jwtRes.json();
          if (data?.success && data?.user) {
            setCurrentUserId(String(data.user.id));
          }
        }
      } catch {}
      // Clerk fallback handled by ChatModal fetch
    };
    getMe();
  }, []);

  const fetchConversations = async () => {
    const res = await fetch('/api/conversations');
    const data = await res.json();
    if (res.ok && data.success) setConversations(data.conversations || []);
  };

  useEffect(() => { fetchConversations(); }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold mb-3">Conversations</h2>
        <div className="divide-y dark:divide-gray-700">
          {conversations.map((c: any) => (
            <button key={c._id} onClick={() => setSelected(c)} className="w-full text-left py-3 hover:bg-gray-50 dark:hover:bg-gray-700 px-2 rounded">
              <div className="flex items-center gap-3">
                {renderAvatar(c.otherParticipant?.profile?.imageUrl, c.otherParticipant?.profile?.name)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.otherParticipant?.profile?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.lastMessage?.content || 'No messages yet'}</p>
                </div>
                {c.unread > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{c.unread}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="md:col-span-2">
        {selected ? (
          <ChatPanel conversationId={selected._id} currentUserId={currentUserId || 'unknown'} />
        ) : (
          <div className="h-[70vh] flex items-center justify-center text-gray-500 dark:text-gray-400">Select a conversation</div>
        )}
      </div>
    </div>
  );
}
