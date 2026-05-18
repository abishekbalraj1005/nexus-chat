'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Bell, Volume2, Smartphone, Monitor, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  
  const [settings, setSettings] = useState({
    sound: true,
    desktopPush: true,
    mobilePush: true
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    // In production, sync this to backend /api/users/settings
  };

  const handlePushPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
           new Notification("Desktop Push Enabled", {
             body: "You will now receive anti-gravity alerts.",
             icon: "https://i.pravatar.cc/150?img=68"
           });
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-6 relative selection:bg-purple-500/30">
      <Link href="/chat" className="absolute top-8 left-8 font-bold text-xl tracking-tight z-20 flex items-center gap-2 text-foreground">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white">N</div>
        Nexus.
      </Link>
      
      <div className="max-w-2xl mx-auto pt-24 pb-12">
        <h1 className="text-4xl font-extrabold mb-8 tracking-tighter">Settings</h1>
        
        {/* Appearance */}
        <div className="glass-panel p-8 rounded-3xl mb-6 shadow-2xl">
           <h3 className="text-xl font-bold mb-6 flex items-center gap-3"><Monitor size={22} className="text-blue-400" /> Appearance</h3>
           <div className="flex gap-4">
             <button onClick={() => setTheme('light')} className={`px-8 py-3 rounded-2xl font-bold border transition-colors ${theme === 'light' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white'}`}>Light</button>
             <button onClick={() => setTheme('dark')} className={`px-8 py-3 rounded-2xl font-bold border transition-colors ${theme === 'dark' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white'}`}>Dark</button>
             <button onClick={() => setTheme('system')} className={`px-8 py-3 rounded-2xl font-bold border transition-colors ${theme === 'system' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white'}`}>System</button>
           </div>
        </div>

        {/* Notifications */}
        <div className="glass-panel p-8 rounded-3xl mb-6 shadow-2xl">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-xl font-bold flex items-center gap-3"><Bell size={22} className="text-purple-400" /> Notifications</h3>
             <button onClick={handlePushPermission} className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-4 py-2 rounded-xl hover:bg-purple-500/20 transition-colors">
               Request Permission
             </button>
           </div>
           
           <div className="space-y-2">
             <ToggleRow 
               icon={<Volume2 size={20} />} 
               title="In-App Sounds & Vibration" 
               desc="Play a soft tone when receiving messages" 
               isActive={settings.sound} 
               onClick={() => toggleSetting('sound')} 
             />
             <ToggleRow 
               icon={<Monitor size={20} />} 
               title="Desktop Push Alerts" 
               desc="Show native macOS/Windows alerts" 
               isActive={settings.desktopPush} 
               onClick={() => toggleSetting('desktopPush')} 
             />
             <ToggleRow 
               icon={<Smartphone size={20} />} 
               title="Mobile Push (FCM)" 
               desc="Receive alerts on your lock screen" 
               isActive={settings.mobilePush} 
               onClick={() => toggleSetting('mobilePush')} 
             />
           </div>
        </div>

        {/* Security */}
        <div className="glass-panel p-8 rounded-3xl mb-6 opacity-60">
           <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><ShieldAlert size={22} className="text-red-400" /> Advanced Security</h3>
           <p className="text-sm text-white/60 mb-6 leading-relaxed">Your messages are secured via TLS structure. Advanced E2EE configuration features are locked in this tier.</p>
           <button className="px-8 py-3 rounded-2xl font-bold bg-white/5 border border-white/10 cursor-not-allowed text-white/50">Enable E2EE (Pro)</button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ icon, title, desc, isActive, onClick }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-4">
        <div className="text-white/50">{icon}</div>
        <div>
          <h4 className="font-bold text-white/90">{title}</h4>
          <p className="text-xs text-white/40">{desc}</p>
        </div>
      </div>
      <div className={`w-14 h-8 rounded-full p-1 transition-colors ${isActive ? 'bg-purple-500' : 'bg-white/10'}`}>
         <motion.div 
           className="w-6 h-6 bg-white rounded-full shadow-md"
           animate={{ x: isActive ? 24 : 0 }}
           transition={{ type: "spring", stiffness: 500, damping: 30 }}
         />
      </div>
    </div>
  );
}
