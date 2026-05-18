'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ImageIcon, FileText, Ban, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function RightPanel({ chatUser, messages, myId }) {
  // Extract images shared in this specific chat
  const chatMessages = messages.filter(m => 
    (m.senderId === chatUser.id && m.receiverId === myId) || 
    (m.senderId === myId && m.receiverId === chatUser.id)
  );

  const images = chatMessages.filter(m => m.imageBase64).map(m => m.imageBase64);

  return (
    <div className="h-full w-full flex flex-col bg-transparent overflow-y-auto minimal-scrollbar">
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-10 pb-6 px-6 border-b border-white/5">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-white/10 relative">
          <img src={chatUser.avatar} alt={chatUser.username} className="w-full h-full object-cover" />
          {chatUser.online && !chatUser.isAI && (
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#0a0a0c] rounded-full flex items-center justify-center">
               <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">{chatUser.username}</h2>
        <p className="text-sm text-white/40 mt-1">
          {chatUser.isAI ? 'Nexus AI Assistant' : chatUser.online ? 'Online now' : chatUser.lastSeen ? `Last seen ${format(new Date(chatUser.lastSeen), 'PP')}` : 'Offline'}
        </p>
      </div>

      {/* Info Section */}
      <div className="px-6 py-6 border-b border-white/5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/30 mb-3">Bio</h3>
        <p className="text-sm text-white/70 font-light leading-relaxed">
          {chatUser.bio || "No bio available. They prefer to stay mysterious."}
        </p>
      </div>

      {/* Shared Media */}
      <div className="px-6 py-6 border-b border-white/5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/30 mb-4 flex justify-between">
          <span>Shared Media</span>
          <span>{images.length}</span>
        </h3>
        
        {images.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {images.slice(0, 6).map((img, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer hover:opacity-80 transition-opacity">
                <img src={img} className="w-full h-full object-cover" alt="Shared" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-white/20">
            <ImageIcon size={32} className="mb-2" />
            <p className="text-xs">No media shared yet</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-6 flex-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/30 mb-4">Actions</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-sm text-white/80">
            <Bell size={16} /> Mute Notifications
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-sm text-red-400">
            <Ban size={16} /> Block User
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-sm text-red-400">
            <Trash2 size={16} /> Clear Chat
          </button>
        </div>
      </div>
    </div>
  );
}
