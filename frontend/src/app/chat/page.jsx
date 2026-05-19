'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import ChatList from '@/components/ChatList';
import ChatRoom from '@/components/ChatRoom';
import RightPanel from '@/components/RightPanel';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatDashboard() {
  const router = useRouter();
  const [socket, setSocket] = useState(null);
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me` : 'http://localhost:3001/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setMe(data.user);
        
        const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
          auth: { token }
        });
        
        setSocket(newSocket);

        newSocket.on('init-data', ({ users, messages }) => {
          setUsers(users);
          setMessages(messages);
          setLoading(false);
        });

        newSocket.on('user-status-changed', ({ id, online, lastSeen }) => {
          setUsers(prev => prev.map(u => u.id === id ? { ...u, online, lastSeen } : u));
        });

        newSocket.on('new-message', (msg) => {
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        });

        newSocket.on('user-typing', ({ userId, isTyping }) => {
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, isTyping } : u));
        });
        
        newSocket.on('messages-read', ({ senderId, receiverId }) => {
          setMessages(prev => prev.map(m => {
            if (m.senderId === senderId && m.receiverId === receiverId) {
              return { ...m, status: 'read' };
            }
            return m;
          }));
        });

      })
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/login');
      });

    return () => socket?.disconnect();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#0a0a0c] overflow-hidden flex font-sans text-white p-2 md:p-4 gap-2 md:gap-4">
      
      {/* Pane 1: Sidebar (ChatList) */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`w-full md:w-[320px] lg:w-[360px] h-full flex-shrink-0 glass-panel rounded-3xl overflow-hidden ${activeChat ? 'hidden md:block' : 'block'}`}
      >
        <ChatList 
          users={users} 
          setUsers={setUsers}
          messages={messages} 
          myId={me.id} 
          onSelectChat={setActiveChat} 
          activeChatId={activeChat?.id}
          me={me}
        />
      </motion.div>

      {/* Pane 2: Main Chat Area (ChatRoom) */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
        className={`flex-1 h-full relative glass-panel rounded-3xl overflow-hidden ${!activeChat ? 'hidden md:flex items-center justify-center' : 'block'}`}
      >
        {!activeChat ? (
          <div className="text-white/40 flex flex-col items-center max-w-sm text-center">
            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
              <Sparkles size={40} className="text-white/60" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white/90 tracking-tight">Anti-Gravity Chat</h2>
            <p className="text-sm font-light text-white/50">Select a conversation or search for a unique username globally to start messaging seamlessly.</p>
          </div>
        ) : (
          <ChatRoom 
            key={activeChat.id}
            chatUser={activeChat} 
            messages={messages} 
            myId={me.id}
            socket={socket}
            onBack={() => setActiveChat(null)} 
          />
        )}
      </motion.div>

      {/* Pane 3: Right Profile Area (RightPanel) */}
      <AnimatePresence>
        {activeChat && (
          <motion.div 
            initial={{ x: 50, opacity: 0, width: 0 }}
            animate={{ x: 0, opacity: 1, width: 320 }}
            exit={{ x: 50, opacity: 0, width: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden lg:block h-full flex-shrink-0 glass-panel rounded-3xl overflow-hidden"
          >
            <div className="w-[320px] h-full">
               <RightPanel 
                 chatUser={activeChat} 
                 messages={messages} 
                 myId={me.id} 
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
