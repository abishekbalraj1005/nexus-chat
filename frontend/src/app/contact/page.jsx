'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-6 relative selection:bg-purple-500/30">
      <Link href="/" className="absolute top-8 left-8 font-bold text-xl tracking-tight z-20 flex items-center gap-2 text-foreground">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white">N</div>
        Nexus.
      </Link>
      
      <div className="max-w-xl mx-auto pt-32">
        <h1 className="text-4xl font-bold mb-4 text-center">Contact Us</h1>
        <p className="text-foreground/60 text-center mb-8">We'd love to hear from you. Send us a message.</p>
        
        <div className="glass-panel p-8 rounded-3xl">
          {sent ? (
            <div className="text-center py-12">
               <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
               <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
               <p className="text-foreground/60">We'll get back to you as soon as possible.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input type="text" required className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-3 px-4 outline-none focus:border-purple-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input type="email" required className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-3 px-4 outline-none focus:border-purple-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Message</label>
                <textarea rows="4" required className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-3 px-4 outline-none focus:border-purple-500 transition-colors resize-none"></textarea>
              </div>
              <button type="submit" className="w-full bg-purple-500 text-white py-3.5 rounded-xl font-bold hover:bg-purple-600 transition-colors mt-4">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
