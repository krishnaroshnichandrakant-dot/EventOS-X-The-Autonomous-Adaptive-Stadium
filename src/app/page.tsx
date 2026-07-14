'use client';

import React, { useState, useEffect } from 'react';
import { StadiumProvider, useStadium } from '@/store/stadiumStore';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import StadiumMap from '@/components/stadium/StadiumMap';
import SmartActionCenter from '@/components/stadium/SmartActionCenter';
import GateStatusList from '@/components/stadium/GateStatusList';
import ZoneDetailPanel from '@/components/stadium/ZoneDetailPanel';
import WeatherOverview from '@/components/climate/WeatherOverview';
import WeatherTimeline from '@/components/climate/WeatherTimeline';
import WeatherAlerts from '@/components/climate/WeatherAlerts';
import RiskPanel from '@/components/risk/RiskPanel';
import RiskDetailModal from '@/components/risk/RiskDetailModal';
import CopilotChat from '@/components/copilot/CopilotChat';
import SimulationController from '@/components/simulation/SimulationController';
import TimeTravelScrubber from '@/components/simulation/TimeTravelScrubber';

function DashboardContent() {
  const { state, dispatch } = useStadium();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [simOpen, setSimOpen] = useState(false);

  // Fetch weather on mount and every 5 minutes
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/weather');
        const data = await res.json();
        dispatch({ type: 'SET_WEATHER', payload: data });
      } catch (err) {
        console.error('Failed to fetch weather:', err);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Simulation Banner */}
        <SimulationController isOpen={simOpen} onClose={() => setSimOpen(false)} />

        {/* Top Bar */}
        <TopBar onSimulate={() => setSimOpen(!simOpen)} />

        {/* Dashboard Grid */}
        <main className="flex-1 overflow-y-auto p-5">
          {activeSection === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-[1600px] mx-auto">
              {/* Row 1: Stadium Map + Gates */}
              <div className="lg:col-span-8 space-y-5">
                <StadiumMap />
                <SmartActionCenter />
              </div>
              <div className="lg:col-span-4 space-y-5">
                <GateStatusList />
                {state.selectedZoneId && <ZoneDetailPanel />}
              </div>

              {/* Row 2: Weather + Risk */}
              <div className="lg:col-span-4">
                <WeatherOverview />
              </div>
              <div className="lg:col-span-4">
                <WeatherTimeline />
              </div>
              <div className="lg:col-span-4">
                <RiskPanel />
              </div>

              {/* Row 3: Weather Alerts */}
              <div className="lg:col-span-12">
                <WeatherAlerts />
              </div>

              {/* Row 4: Time-Travel Playback Scrubber (Wow #4) */}
              <div className="lg:col-span-12">
                <TimeTravelScrubber />
              </div>
            </div>
          )}

          {activeSection === 'stadium' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-[1600px] mx-auto">
              <div className="lg:col-span-8 space-y-5">
                <StadiumMap />
                <SmartActionCenter />
              </div>
              <div className="lg:col-span-4 space-y-5">
                <GateStatusList />
                <ZoneDetailPanel />
              </div>
            </div>
          )}

          {activeSection === 'climate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-[1600px] mx-auto">
              <div className="lg:col-span-5">
                <WeatherOverview />
              </div>
              <div className="lg:col-span-7">
                <WeatherTimeline />
              </div>
              <div className="lg:col-span-12">
                <WeatherAlerts />
              </div>
            </div>
          )}

          {activeSection === 'risk' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-[1600px] mx-auto">
              <div className="lg:col-span-6">
                <RiskPanel />
              </div>
              <div className="lg:col-span-6">
                <WeatherAlerts />
              </div>
            </div>
          )}

          {activeSection === 'copilot' && (
            <div className="max-w-3xl mx-auto">
              <CopilotFullPage />
            </div>
          )}
        </main>
      </div>

      {/* Floating Copilot (available on all pages except copilot tab) */}
      {activeSection !== 'copilot' && <CopilotChat />}

      {/* Risk Detail Modal */}
      <RiskDetailModal />
    </div>
  );
}

// Full-page copilot view when the Copilot nav is selected
function CopilotFullPage() {
  const { state, dispatch } = useStadium();
  const [messages, setMessages] = useState<
    { id: string; role: 'user' | 'assistant'; content: string }[]
  >([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { buildSystemPrompt, getStateContext } = await import('@/lib/gemini');
      const systemPrompt = buildSystemPrompt(state);
      const context = getStateContext(state);

      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${text.trim()} ${context}`,
          systemPrompt,
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
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

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply || data.response || 'Action processed.' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, something went wrong.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "What's our biggest risk right now?",
    'Suggest a way to reduce congestion at Gate D',
    'How does the weather impact today\'s operations?',
    'Create an action plan for a potential rainstorm',
    'Summarize the current stadium status',
  ];

  return (
    <div className="card-lg overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-[17px] font-bold text-white">EventOS Copilot</h2>
          <p className="text-[12px] text-blue-200 mt-0.5">
            AI-powered operations assistant • Powered by Gemini
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-gray-800 mb-2">
                How can I help with operations?
              </h3>
              <p className="text-[13px] text-gray-400 mb-6 max-w-md mx-auto">
                I have access to live stadium data including zone occupancy, gate status, weather conditions, and risk assessments.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left px-4 py-3 rounded-xl bg-white border border-gray-200 text-[12px] text-gray-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-5 py-3 text-[13px] leading-relaxed ${
                  msg.role === 'user' ? 'chat-user' : 'chat-assistant'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="chat-assistant px-5 py-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask about stadium operations, risks, weather..."
              className="flex-1 px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Page — wraps everything in the StadiumProvider
// ============================================================

export default function Home() {
  return (
    <StadiumProvider>
      <DashboardContent />
    </StadiumProvider>
  );
}
