import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  Minimize2,
} from 'lucide-react';
import { DayRecord, DayAppSettings, CourseSubject, DayAttendanceStats } from '../types';
import { processLocalQuery, AssistantResponse } from '../utils/localAssistantEngine';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  action?: {
    label: string;
    tab?: 'dashboard' | 'log' | 'forecast' | 'settings';
  };
}

interface AttendanceChatbotProps {
  records: DayRecord[];
  settings: DayAppSettings;
  subjects?: CourseSubject[];
  stats: DayAttendanceStats;
  onNavigateTab?: (tab: 'dashboard' | 'log' | 'forecast' | 'settings') => void;
}

export const AttendanceChatbot: React.FC<AttendanceChatbotProps> = ({
  records,
  settings,
  subjects = [],
  stats,
  onNavigateTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Retain session conversation
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello${
        settings.studentName ? ` ${settings.studentName}` : ''
      }! 👋 I'm Attendify AI.\n\nAsk me about your attendance percentage, today's status, classes needed, Morning Call reminders, or college schedule.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickSuggestions = [
    'My attendance',
    "Today's status",
    'Morning Call',
    'Is college open today?',
    'Classes needed',
    'How do I export CSV?',
  ];

  // Auto-scroll conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Process local rule-based intelligence
    setTimeout(() => {
      const response: AssistantResponse = processLocalQuery(query, {
        records,
        settings,
        stats,
        subjects,
      });

      const botMsg: Message = {
        id: `b_${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: response.suggestedAction,
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 180);
  };

  const handleActionClick = (action: { label: string; tab?: 'dashboard' | 'log' | 'forecast' | 'settings' }) => {
    if (action.tab && onNavigateTab) {
      onNavigateTab(action.tab);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Chatbot Launch Button */}
      <div className="fixed bottom-20 right-4 sm:bottom-22 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close Attendance Assistant' : 'Open Attendance Assistant'}
          title="Attendance Assistant"
          type="button"
          className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-primary to-[#FB7185] text-white shadow-[0_8px_24px_-4px_rgba(225,29,72,0.45)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-white/80"
        >
          {/* Subtle Ambient Glow */}
          <span className="absolute -inset-1 rounded-full bg-primary/20 blur-sm group-hover:bg-primary/30 transition-all pointer-events-none" />

          {isOpen ? (
            <X className="w-6 h-6 text-white shrink-0 relative z-10 transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            /* Custom Modern Robot Logo SVG */
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 relative z-10 transition-transform group-hover:scale-110 duration-200"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Antenna */}
              <circle cx="18" cy="4" r="2" fill="white" />
              <path d="M18 6V9" stroke="white" strokeWidth="2" strokeLinecap="round" />

              {/* Robot Head Body */}
              <rect
                x="6"
                y="9"
                width="24"
                height="20"
                rx="6"
                fill="white"
                fillOpacity="0.95"
              />

              {/* Ears */}
              <rect x="3" y="15" width="3" height="8" rx="1.5" fill="white" />
              <rect x="30" y="15" width="3" height="8" rx="1.5" fill="white" />

              {/* Visor Screen */}
              <rect
                x="9"
                y="12"
                width="18"
                height="11"
                rx="3.5"
                fill="#1E1B4B"
              />

              {/* Glowing Friendly Eyes */}
              <circle cx="13.5" cy="17.5" r="2" fill="#38BDF8" />
              <circle cx="22.5" cy="17.5" r="2" fill="#38BDF8" />

              {/* Cheerful Robot Mouth Indicator */}
              <path
                d="M14 25C15.5 26.2 20.5 26.2 22 25"
                stroke="#E11D48"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}

          {/* Online Local Intelligence Dot */}
          {!isOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-xs" />
          )}
        </button>
      </div>

      {/* Floating Chat Panel Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Attendance Assistant Chat"
          className="fixed bottom-20 right-3 left-3 sm:left-auto sm:right-6 sm:bottom-24 z-50 sm:w-[380px] h-[520px] max-h-[78vh] rounded-3xl bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.22)] border border-slate-200/90 flex flex-col overflow-hidden animate-in slide-in-from-bottom-3 duration-250"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-white/10 text-white">
                <Bot className="w-5 h-5 text-rose-300" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight">Attendify AI</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close assistant"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 items-end ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-[#FB7185] flex items-center justify-center text-white shrink-0 text-[10px]">
                    🤖
                  </div>
                )}

                <div className="flex flex-col gap-1 max-w-[82%]">
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl whitespace-pre-line leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white rounded-br-xs font-medium'
                        : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/70 font-normal'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Optional Action Button */}
                  {msg.action && (
                    <button
                      onClick={() => handleActionClick(msg.action!)}
                      className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-rose-50 text-primary border border-primary/20 font-bold text-[11px] hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs mt-0.5"
                    >
                      <span>{msg.action.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  <span
                    className={`text-[9px] px-1 text-slate-400 ${
                      msg.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickSuggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleSendMessage(sug)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-primary text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer border border-slate-200/60"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-slate-200/80 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask attendance, schedule, profile..."
              className="flex-1 px-3.5 py-2 bg-slate-100 rounded-full text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/25 border border-slate-200/80 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              aria-label="Send message"
              className="w-8 h-8 rounded-full bg-primary disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-xs hover:bg-rose-600 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
