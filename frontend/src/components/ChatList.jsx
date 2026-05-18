'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Settings, Edit, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import Link from 'next/link';

export default function ChatList({ users, setUsers, messages, myId, onSelectChat, activeChatId, me }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Put AI assistant at the top
  const sortedUsers = [...users].sort((a, b) => {
    if (a.isAI) return -1;
    if (b.isAI) return 1;
    return 0;
  });

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    
    if (q.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${baseUrl}/api/users/search?q=${q}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSearchResults(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const startChatWithSearchedUser = (user) => {
    // Check if user is already in our recent users list
    if (!users.find(u => u.id === user.id)) {
      setUsers(prev => [user, ...prev]);
    }
    setSearchQuery('');
    setSearchResults([]);
    onSelectChat(user);
  };

  const displayList = searchQuery.trim().length > 0 ? searchResults : sortedUsers;

  return (
    <div className="h-full w-full flex flex-col bg-transparent relative">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 flex justify-between items-center z-10 sticky top-0 bg-[#0a0a0c]/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="magnetic-wrap hover:scale-105 transition-transform">
            <img src={me?.avatar} alt="Me" className="w-10 h-10 rounded-full object-cover border border-white/10" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Inbox</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/settings" className="h-9 w-9 rounded-full glass-button flex items-center justify-center text-white/70">
            <Settings size={18} />
          </Link>
          <button className="h-9 w-9 rounded-full glass-button flex items-center justify-center text-white/70">
            <Edit size={18} />
          </button>
        </div>
      </div>

      {/* Global Username Search Bar */}
      <div className="px-4 pb-3 pt-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 py-3 focus-within:border-white/30 transition-colors shadow-inner">
          {isSearching ? <Loader2 size={18} className="text-white/40 animate-spin" /> : <Search size={18} className="text-white/40" />}
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search username globally..." 
            className="bg-transparent border-none outline-none text-white ml-3 w-full placeholder-white/40 font-medium text-[15px]"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto minimal-scrollbar px-3 pb-6 mt-2">
        {searchQuery.trim().length > 0 && (
          <div className="px-2 mb-2 text-xs font-bold tracking-wider text-white/30 uppercase">
            Global Results
          </div>
        )}

        {displayList.length === 0 && searchQuery.trim().length > 0 && (
          <div className="text-center py-10 text-white/30 text-sm">No users found matching "{searchQuery}"</div>
        )}

        {displayList.map((user, i) => {
          const userMsgs = messages.filter(m => (m.senderId === user.id && m.receiverId === myId) || (m.senderId === myId && m.receiverId === user.id));
          const lastMsg = userMsgs.length > 0 ? userMsgs[userMsgs.length - 1] : null;
          const isActive = activeChatId === user.id;

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 30 }}
              key={user.id}
              onClick={() => searchQuery.trim().length > 0 ? startChatWithSearchedUser(user) : onSelectChat(user)}
              className={clsx(
                "flex items-center gap-4 p-3 rounded-2xl transition-all cursor-pointer mb-1 group",
                isActive ? "bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]" : "hover:bg-white/[0.04] border border-transparent"
              )}
            >
              <div className="relative h-14 w-14 flex-shrink-0">
                <img src={user.avatar} alt={user.username} className="rounded-full w-full h-full object-cover border border-white/10 transform group-hover:scale-105 transition-transform" />
                {user.isAI && (
                  <div className="absolute -bottom-1 -right-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-white/10">AI</div>
                )}
                {!user.isAI && user.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-[#0a0a0c] rounded-full flex items-center justify-center">
                    <div className="h-2.5 w-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={clsx("font-bold truncate text-[16px] tracking-tight", user.isAI ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400" : "text-white/95")}>
                    {user.username}
                  </h3>
                  {lastMsg && (
                    <span className={clsx("text-[11px] font-semibold", isActive ? "text-white/80" : "text-white/40")}>
                      {formatDistanceToNow(new Date(lastMsg.timestamp), { addSuffix: false }).replace('about ', '')}
                    </span>
                  )}
                </div>
                <p className={clsx(
                  "text-[14px] truncate font-medium", 
                  user.isTyping ? "text-blue-400" : (lastMsg?.status === 'sent' && lastMsg?.receiverId === myId && !isActive) ? "text-white" : "text-white/50"
                )}>
                  {user.isTyping ? (
                    'Typing...'
                  ) : lastMsg ? (
                    lastMsg.imageBase64 ? '📷 Image' :
                    lastMsg.audioBlob ? '🎤 Voice message' : lastMsg.text
                  ) : (
                    user.isAI ? 'Ready to assist' : 'Tap to start conversation'
                  )}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
