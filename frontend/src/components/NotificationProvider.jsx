'use client';

import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'sonner';
import { usePathname } from 'next/navigation';

export default function NotificationProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      auth: { token }
    });

    setSocket(newSocket);

    // Audio for in-app notification
    const popSound = typeof window !== 'undefined' ? new Audio('https://cdn.freesound.org/previews/421/421704_5121236-lq.mp3') : null;

    newSocket.on('new-message', (msg) => {
      // Don't pop notification if we are actively chatting with this user on the /chat page.
      // (For this simple provider, we'll just check if we are on /chat. In production, we'd check activeChatId).
      const isOnChatPage = pathname === '/chat';
      
      if (!isOnChatPage) {
        // Play Sound
        if (popSound) {
           popSound.volume = 0.5;
           popSound.play().catch(e => console.log("Audio play blocked by browser:", e));
        }

        // Sonner In-App Toast
        toast.custom((t) => (
          <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 shadow-2xl min-w-[300px] border border-white/10 animate-in slide-in-from-right-10 fade-in duration-500">
             <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
               <img src="https://i.pravatar.cc/150?img=68" alt="Sender" className="w-full h-full object-cover" />
             </div>
             <div className="flex flex-col flex-1">
               <h4 className="text-white font-bold tracking-tight text-sm">New Message</h4>
               <p className="text-white/60 text-xs truncate max-w-[200px]">{msg.text || "Sent a media file"}</p>
             </div>
             <button onClick={() => toast.dismiss(t)} className="text-white/40 hover:text-white transition-colors">
               ✕
             </button>
          </div>
        ), { duration: 4000 });

        // Native Web Push (Desktop Push)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification("New Message", {
            body: msg.text || "Sent a media file",
            icon: "https://i.pravatar.cc/150?img=68",
            silent: false 
          });
        }
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [pathname]);

  return (
    <>
      <Toaster 
        position="top-right" 
        expand={true} 
        visibleToasts={3} 
        toastOptions={{
          style: {
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
          }
        }}
      />
      {children}
    </>
  );
}
