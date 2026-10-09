import React, { useState } from 'react';
import { Sparkles, MessageCircle, X, Send, Bot } from 'lucide-react';
import { askChefAI } from '../../services/geminiService';

export const ChefAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'chef'; text: string }[]>([
    {
      sender: 'chef',
      text: 'Namaste! I am Chef Cravely 👨‍🍳. Ask me anything about scaling recipes, dairy-free swaps, or fixing curries!',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askChefAI({
        userPrompt: text,
      });
      setMessages((prev) => [...prev, { sender: 'chef', text: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'chef',
          text: 'Here is a quick chef tip: Roast your dry spices on low heat for 30 seconds before adding purees for maximum aroma!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Floating Trigger Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white p-3.5 sm:px-4 sm:py-3 shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer active:scale-95 border border-slate-700"
          title="Ask Chef Cravely AI"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline text-xs font-black">
            Ask Chef AI
          </span>
        </button>
      ) : (
        /* Chat Drawer / Window */
        <div className="w-80 sm:w-96 rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col h-[460px] overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 bg-slate-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-black">Chef Cravely (Gemini)</h4>
                <span className="text-[10px] text-emerald-400 font-medium">Reels to Meals Assistant</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick presets */}
          <div className="bg-slate-50 p-2 flex gap-1.5 overflow-x-auto text-[11px] border-b border-slate-100">
            {['Dairy-free swap', 'Too spicy!', 'Too salty!'].map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-slate-700 border border-slate-200 hover:border-emerald-500 transition cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 whitespace-pre-line leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#08B968] text-white font-medium'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl p-3 text-slate-500 text-xs animate-pulse">
                  Chef is cooking up an answer...
                </div>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-slate-100 flex gap-2 bg-white">
            <input
              type="text"
              placeholder="Ask for culinary advice..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-900 border border-slate-200 focus:outline-none focus:border-[#08B968]"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#08B968] text-white disabled:opacity-50 transition cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
