'use client';

import React from 'react';
import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-6 relative selection:bg-purple-500/30">
      <Link href="/" className="absolute top-8 left-8 font-bold text-xl tracking-tight z-20 flex items-center gap-2 text-foreground">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white">N</div>
        Nexus.
      </Link>
      
      <div className="max-w-3xl mx-auto pt-32 text-center">
        <h1 className="text-4xl font-bold mb-6">About Nexus</h1>
        <p className="text-xl text-foreground/60 mb-12">Building the future of personal and AI communication.</p>
        
        <div className="glass-panel p-8 rounded-3xl text-left">
           <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
           <p className="text-foreground/80 leading-relaxed mb-6">
             Nexus was founded with a single goal: to provide a premium, secure, and beautiful interface for 1-on-1 communication. We believe that chatting with your friends, colleagues, and AI assistants should feel seamless and inspiring.
           </p>
           <h3 className="text-2xl font-semibold mb-4">The Technology</h3>
           <p className="text-foreground/80 leading-relaxed">
             Built on modern technologies including Next.js, Node.js, and WebSockets, Nexus offers real-time messaging, end-to-end security architecture, and an uncompromising dedication to design aesthetics.
           </p>
        </div>
      </div>
    </div>
  );
}
