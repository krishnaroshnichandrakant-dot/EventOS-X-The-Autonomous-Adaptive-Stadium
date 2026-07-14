'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, X, Sparkles, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { useStadium } from '@/store/stadiumStore';
import { buildSystemPrompt, getStateContext } from '@/lib/gemini';
import { ChatMessage } from '@/types';

const quickPrompts = [
  "What's our biggest risk right now?",
  'Suggest a fix for gate congestion',
  'Weather impact on operations?',
  'Which zones need attention?',
];

export default function CopilotChat() {
  const { state, dispatch } = useStadium();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(state);
      const context = getStateContext(state);

      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${text.trim()} ${context}`,
          systemPrompt,
          history: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      // Agentic Execution (Wow #3)
      if (data.action === 'TOGGLE_GATE' && data.payload) {
        dispatch({
          type: 'TOGGLE_GATE',
          payload: { id: data.payload.id, status: data.payload.status },
        });
      } else if (data.action === 'START_SIMULATION' && data.payload) {
        dispatch({
          type: 'START_SIMULATION',
          payload: data.payload.id,
        });
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || data.response || 'Action processed.',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Agentic Copilot Error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 px-5 py-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-colors cursor-pointer"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bot className="w-5 h-5" />
            <span className="text-[13px] font-semibold">AI Copilot</span>
            <Sparkles className="w-3.5 h-3.5 opacity-70" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed z-40 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden ${
              isExpanded
                ? 'bottom-4 right-4 left-4 top-20'
                : 'bottom-6 right-6 w-[400px] h-[560px]'
            }`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
                  <Bot className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-white">EventOS Copilot</h3>
                  <p className="text-[10px] text-blue-200">Powered by Gemini AI</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4 text-white/70" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-white/70" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 mb-3">
                    <Sparkles className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-[14px] font-semibold text-gray-800 mb-1">
                    How can I help?
                  </p>
                  <p className="text-[12px] text-gray-400 mb-5">
                    I have access to live stadium data, weather, and risk assessments.
                  </p>

                  {/* Quick Prompts */}
                  <div className="space-y-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="w-full text-left px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[12px] text-gray-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === 'user' ? 'chat-user' : 'chat-assistant'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="chat-assistant px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    <span className="text-[12px] text-gray-400">Thinking...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about stadium operations..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
