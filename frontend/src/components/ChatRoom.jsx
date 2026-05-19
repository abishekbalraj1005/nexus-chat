'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Mic, Send, Smile, Paperclip, Check, CheckCheck, Play, Square, Trash, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import EmojiPicker from 'emoji-picker-react';

export default function ChatRoom({ chatUser, messages, myId, onBack, socket }) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const scrollRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isRecording]);



  const handleDeleteMessage = (messageId) => {
    if (socket) {
      socket.emit('delete-message', { messageId });
    }
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    socket.emit('send-message', { receiverId: chatUser.id, text: inputText, imageBase64: null, audioBlob: null });
    setInputText('');
    setShowEmojiPicker(false);
    socket.emit('typing-stop', chatUser.id);
  };

  const handleTyping = (e) => {
    setInputText(e.target.value);
    if (e.target.value.length > 0) socket.emit('typing-start', chatUser.id);
    else socket.emit('typing-stop', chatUser.id);
  };

  const onEmojiClick = (emojiObject) => {
    setInputText(prev => prev + emojiObject.emoji);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        socket.emit('send-message', { receiverId: chatUser.id, text: null, imageBase64: reader.result, audioBlob: null });
      };
      reader.readAsDataURL(file);
    }
  };

  const drawWaveform = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    setVolumeLevel(Math.min(100, (average / 128) * 100));
    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      drawWaveform();

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        socket.emit('send-message', { receiverId: chatUser.id, text: null, imageBase64: null, audioBlob: arrayBuffer });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setVolumeLevel(0);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current?.state === 'running') audioContextRef.current.close();
    }
  };

  const playVoiceNote = async (msgId, arrayBuffer) => {
    if (playingAudioId === msgId) return;
    setPlayingAudioId(msgId);
    const blob = new Blob([arrayBuffer], { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    audio.onended = () => {
      setPlayingAudioId(null);
      URL.revokeObjectURL(url);
    };
    await audio.play();
  };

  const chatMessages = messages.filter(m => 
    (m.senderId === chatUser.id && m.receiverId === myId) || 
    (m.senderId === myId && m.receiverId === chatUser.id)
  );

  useEffect(() => {
    if (socket && chatUser) {
      const hasUnread = chatMessages.some(m => m.senderId === chatUser.id && m.status !== 'read');
      if (hasUnread) {
        socket.emit('mark-read', { senderId: chatUser.id });
      }
    }
  }, [chatUser, socket, chatMessages]);

  return (
    <div className="h-full w-full flex flex-col bg-transparent relative font-sans">
      
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between z-20 sticky top-0 border-b border-white/5 bg-[#0a0a0c]/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-white/50 hover:text-white rounded-full transition-colors flex items-center justify-center">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col">
            <h2 className="font-bold text-white tracking-tight text-lg flex items-center gap-2">
              {chatUser.username}
              {chatUser.isAI && <Sparkles size={14} className="text-purple-400" />}
            </h2>
            <span className="text-xs font-semibold text-white/40">
              {chatUser.isTyping ? <span className="text-blue-400">Typing...</span> : chatUser.isAI ? 'Nexus Intelligence' : chatUser.online ? <span className="text-green-400">Online</span> : 'Offline'}
            </span>
          </div>
        </div>

      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto minimal-scrollbar px-6 py-8 flex flex-col gap-6 z-10 scroll-smooth relative">
        {/* Anti-gravity ambient background glow matching contact */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] bg-purple-500/5 blur-[150px] pointer-events-none -z-10" />

        {chatMessages.map((msg, i) => {
          const isMe = msg.senderId === myId;
          const showAvatar = !isMe && (i === 0 || chatMessages[i-1].senderId !== msg.senderId);

          return (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              key={msg.id} 
              className={clsx("flex gap-3 max-w-[85%] md:max-w-[70%]", isMe ? "self-end" : "self-start")}
            >
              {!isMe && showAvatar ? (
                <img src={chatUser.avatar} className="w-8 h-8 rounded-full self-end mb-1 hidden md:block border border-white/10" alt="" />
              ) : !isMe ? (
                <div className="w-8 hidden md:block" />
              ) : null}

              <div className="flex flex-col gap-1.5 w-full">
                <div className={clsx("group relative flex items-center gap-2 w-full", isMe ? "justify-end" : "justify-start")}>
                  {isMe && (
                    <button 
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-white/30 hover:text-red-400 hover:bg-white/5 rounded-full transition-all duration-200 cursor-pointer flex-shrink-0"
                      title="Delete message"
                    >
                      <Trash size={15} />
                    </button>
                  )}

                  <div className={clsx(
                    "px-5 py-3.5 text-[15px] leading-relaxed relative w-fit max-w-[85%] shadow-2xl backdrop-blur-xl",
                    isMe ? "bg-white text-black rounded-3xl rounded-br-sm" : "glass-panel text-white rounded-3xl rounded-bl-sm",
                    (msg.audioBlob || msg.imageBase64) && "!p-1.5"
                  )}>
                    {msg.imageBase64 ? (
                      <img src={msg.imageBase64} alt="Shared" className="rounded-2xl max-w-full max-h-[300px] object-cover" />
                    ) : msg.audioBlob ? (
                      <div className="flex items-center gap-3 p-2 min-w-[220px]">
                        <button 
                          onClick={() => playVoiceNote(msg.id, msg.audioBlob)} 
                          className={clsx("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90", isMe ? "bg-black text-white" : "bg-white text-black")}
                        >
                          {playingAudioId === msg.id ? <Square size={16} className="fill-current" /> : <Play size={18} className="ml-1 fill-current" />}
                        </button>
                        <div className="flex-1 flex flex-col justify-center gap-1.5">
                          <div className="flex items-center gap-[3px] h-4">
                            {[...Array(15)].map((_, idx) => (
                              <motion.div 
                                key={idx} 
                                className={clsx("w-1 rounded-full", isMe ? "bg-black/80" : "bg-white/80")} 
                                initial={{ height: "20%" }} 
                                animate={{ height: playingAudioId === msg.id ? `${20 + Math.random() * 80}%` : "20%" }} 
                                transition={{ duration: playingAudioId === msg.id ? 0.2 : 0, repeat: playingAudioId === msg.id ? Infinity : 0, repeatType: "reverse" }} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="break-words tracking-tight">{msg.text}</p>
                    )}
                  </div>

                  {!isMe && (
                    <button 
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-white/30 hover:text-red-400 hover:bg-white/5 rounded-full transition-all duration-200 cursor-pointer flex-shrink-0"
                      title="Delete message"
                    >
                      <Trash size={15} />
                    </button>
                  )}
                </div>
                <div className={clsx("flex items-center gap-1 text-[11px] text-white/30 px-2 font-semibold tracking-wider", isMe && "justify-end")}>
                  {format(new Date(msg.timestamp), 'HH:mm')}
                  {isMe && (msg.status === 'read' ? <CheckCheck size={14} className="text-blue-400" /> : msg.status === 'delivered' ? <CheckCheck size={14} /> : <Check size={14} />)}
                </div>
              </div>
            </motion.div>
          );
        })}
        {chatUser.isTyping && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 max-w-[80%] self-start">
            <img src={chatUser.avatar} className="w-8 h-8 rounded-full self-end mb-1 hidden md:block" alt="" />
            <div className="glass-panel px-5 py-4 flex gap-1.5 items-center h-12 rounded-3xl rounded-bl-sm shadow-xl">
              <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] z-20 border-t border-white/5 bg-[#0a0a0c]/80 backdrop-blur-3xl relative">
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-full mb-4 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10">
              <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" previewConfig={{ showPreview: false }} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-3 max-w-4xl mx-auto w-full">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl flex items-end px-2 py-1.5 transition-all focus-within:border-white/30 focus-within:bg-white/[0.07] shadow-inner">
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-white/40 hover:text-white transition-colors self-end mb-1 rounded-full">
              <Smile size={22} />
            </button>
            <textarea
              rows="1"
              value={inputText}
              onChange={handleTyping}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendText(); } }}
              placeholder="iMessage..."
              className="w-full bg-transparent border-none outline-none text-white resize-none max-h-32 py-2.5 px-3 font-medium text-[16px]"
              style={{ minHeight: '44px' }}
            />
            <button 
              disabled={!inputText.trim()} 
              onClick={handleSendText} 
              className={clsx(
                "p-2.5 mb-0.5 rounded-full self-end transition-all flex-shrink-0",
                inputText.trim() ? "bg-white text-black shadow-lg hover:scale-105 active:scale-95 cursor-pointer" : "bg-white/5 text-white/20 cursor-not-allowed"
              )}
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
