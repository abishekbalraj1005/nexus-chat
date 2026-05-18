'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, Settings as SettingsIcon, Bell } from 'lucide-react';

export default function Profile() {
  const router = useRouter();
  const [me, setMe] = useState(null);

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
      .then(data => setMe(data.user))
      .catch(() => router.push('/login'));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (!me) return null;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-6 relative selection:bg-purple-500/30">
      <Link href="/chat" className="absolute top-8 left-8 font-bold text-xl tracking-tight z-20 flex items-center gap-2 text-foreground">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white">N</div>
        Nexus.
      </Link>
      
      <div className="max-w-2xl mx-auto pt-24">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        
        <div className="glass-panel p-8 rounded-3xl mb-6">
          <div className="flex items-center gap-6">
            <img src={me.avatar} className="w-24 h-24 rounded-full border-2 border-purple-500/50" alt="Avatar" />
            <div>
              <h2 className="text-2xl font-bold">{me.username}</h2>
              <p className="text-foreground/60">{me.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/settings" className="glass-panel p-6 rounded-3xl flex items-center gap-4 hover:bg-foreground/5 transition-colors cursor-pointer">
             <SettingsIcon size={24} className="text-purple-500" />
             <div>
               <h3 className="font-semibold">Settings</h3>
               <p className="text-sm text-foreground/50">Preferences and theme</p>
             </div>
          </Link>
          <div className="glass-panel p-6 rounded-3xl flex items-center gap-4 hover:bg-foreground/5 transition-colors cursor-pointer">
             <Bell size={24} className="text-blue-500" />
             <div>
               <h3 className="font-semibold">Notifications</h3>
               <p className="text-sm text-foreground/50">Manage alerts</p>
             </div>
          </div>
        </div>

        <button onClick={handleLogout} className="mt-8 flex items-center gap-2 text-red-500 font-semibold hover:opacity-80 transition-opacity">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
}
