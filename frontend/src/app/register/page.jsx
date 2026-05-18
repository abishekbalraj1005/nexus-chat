'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register` : 'http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      localStorage.setItem('token', data.token);
      router.push('/chat');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
      
      <Link href="/" className="absolute top-8 left-8 font-bold text-xl tracking-tight z-20 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white">N</div>
        Nexus.
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Create Account</h2>
          <p className="text-foreground/60 text-sm">Join Nexus to chat with humans and AI.</p>
        </div>

        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-xl mb-6 text-sm text-center font-medium">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground/80">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-purple-500 transition-colors"
                placeholder="Cmdr. Shepard"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground/80">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-purple-500 transition-colors"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground/80">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-purple-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-foreground text-background py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-4"
          >
            Create Account <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center text-sm text-foreground/60 mt-8 font-medium">
          Already have an account? <Link href="/login" className="text-purple-500 hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
