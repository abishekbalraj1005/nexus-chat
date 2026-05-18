'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Link from 'next/link';
import { ArrowRight, Search, Zap, Lock, Sparkles } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);

  // Framer Motion Parallax for Hero
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    // Custom Glow Cursor
    const handleMouseMove = (e) => {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.8,
        ease: 'power3.out'
      });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Magnetic Buttons
    const magnets = document.querySelectorAll('.magnetic');
    magnets.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left) - rect.width / 2;
        const y = (e.clientY - rect.top) - rect.height / 2;
        gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 0.6, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
      });
    });

    // Intro Animations
    gsap.fromTo('.hero-text', 
      { opacity: 0, y: 100, rotateX: -20 },
      { opacity: 1, y: 0, rotateX: 0, duration: 1.5, stagger: 0.1, ease: 'expo.out', delay: 0.2 }
    );
    gsap.fromTo('.hero-card',
      { opacity: 0, y: 150, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 2, ease: 'expo.out', delay: 0.5 }
    );

    // Feature Scroll Animations
    gsap.utils.toArray('.feature-row').forEach(row => {
      gsap.fromTo(row, 
        { opacity: 0, y: 100 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1.2, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 85%',
          }
        }
      );
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-[200vh] bg-[hsl(var(--background))] overflow-hidden relative">
      
      {/* Custom Cursor */}
      <div ref={cursorRef} className="fixed top-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none z-0 transform -translate-x-1/2 -translate-y-1/2 mix-blend-screen" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 lg:px-12 py-6 flex justify-between items-center mix-blend-difference text-white">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tighter">
          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm">N</div>
          Nexus.
        </div>
        <div className="flex items-center gap-6 font-medium text-sm">
          <Link href="/login" className="hover:opacity-60 transition-opacity">Login</Link>
          <div className="magnetic cursor-pointer">
            <Link href="/register" className="bg-white text-black px-5 py-2.5 rounded-full hover:scale-105 transition-transform inline-block">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative h-screen flex flex-col items-center justify-center text-center px-6 z-10 perspective-[1000px]">
        <motion.div style={{ y: y1, opacity }} className="max-w-5xl mx-auto flex flex-col items-center">
          <div className="hero-text inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-button text-sm font-medium mb-8 text-foreground/80 border border-white/10">
            <Sparkles size={14} className="text-purple-400" /> Introducing Anti-Gravity UI
          </div>
          
          <h1 className="hero-text text-[12vw] md:text-[8vw] font-bold tracking-tighter leading-[0.9] text-white mb-6">
            Conversations <br/> <span className="text-gradient">Beyond Limits</span>
          </h1>
          
          <p className="hero-text text-lg md:text-2xl text-white/50 max-w-2xl font-light mb-12">
            A radically new cinematic messaging experience. No phone numbers. Just beautiful, fluid, human connection floating in space.
          </p>

          <div className="hero-text magnetic cursor-pointer">
            <Link href="/register" className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all">
              Claim your Username <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Floating App Mockup */}
      <motion.div style={{ y: y2 }} className="hero-card relative z-20 max-w-6xl mx-auto px-6 -mt-20 md:-mt-40 mb-40 perspective-[2000px]">
        <div className="w-full aspect-[16/10] md:aspect-[21/9] glass-panel rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden relative group transform-gpu">
           {/* Mockup Header */}
           <div className="absolute top-0 w-full h-14 bg-white/[0.02] border-b border-white/5 flex items-center px-6 gap-2 backdrop-blur-md z-30">
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
           </div>
           
           {/* Mockup Content - Anti gravity bubbles */}
           <div className="absolute inset-0 pt-14 p-8 flex flex-col gap-4 justify-end pb-12 bg-gradient-to-b from-transparent to-black/40">
             <div className="self-start glass-panel px-6 py-4 rounded-3xl rounded-tl-sm max-w-sm transform group-hover:translate-y-[-10px] transition-transform duration-700">
               <p className="text-white/80">Hey, have you seen the new Nexus UI?</p>
             </div>
             <div className="self-end bg-gradient-to-br from-purple-600 to-blue-600 px-6 py-4 rounded-3xl rounded-tr-sm max-w-sm text-white shadow-lg transform group-hover:translate-y-[-20px] transition-transform duration-1000">
               <p>Yeah, the anti-gravity physics are insane. It feels completely weightless! 🚀</p>
             </div>
           </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto relative z-10">
        <div className="feature-row flex flex-col md:flex-row items-center gap-16 mb-40">
          <div className="flex-1">
            <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center mb-8 text-purple-400">
              <Search size={32} />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">Global Search. <br/><span className="text-white/40">No Phone Numbers.</span></h2>
            <p className="text-xl text-white/50 leading-relaxed">
              Ditch the SIM card. Create a unique, elegant username and instantly connect with anyone around the globe. Privacy meets absolute freedom.
            </p>
          </div>
          <div className="flex-1 w-full aspect-square glass-panel rounded-full blur-[2px] opacity-80 flex items-center justify-center border border-white/10 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent" />
             <div className="text-3xl font-bold text-white/80 tracking-widest">@commander</div>
          </div>
        </div>

        <div className="feature-row flex flex-col md:flex-row-reverse items-center gap-16 mb-20">
          <div className="flex-1">
            <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center mb-8 text-blue-400">
              <Zap size={32} />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">Fluid Motion. <br/><span className="text-white/40">Zero Latency.</span></h2>
            <p className="text-xl text-white/50 leading-relaxed">
              Every message, hover, and scroll is meticulously animated using spring physics to mimic real-world inertia, wrapped in an ultra-fast WebSocket engine.
            </p>
          </div>
          <div className="flex-1 w-full aspect-square glass-panel rounded-[3rem] opacity-80 flex items-center justify-center relative border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-[3rem]" />
             <div className="flex gap-2 items-center px-6 py-4 glass-button rounded-full text-white">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /> Live WebSocket
             </div>
          </div>
        </div>
      </section>

    </div>
  );
}
