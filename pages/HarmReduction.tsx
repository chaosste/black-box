
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { GoogleGenAI } from "@google/genai";
import { ShieldAlert, Send, Bot, User, RefreshCcw, Heart, Info, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const HarmReduction: React.FC = () => {
  const { darkMode } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "FacilitatorAI online. I am accessing the Dr. Leary Psychedelic Integration RAG database to assist your journey. How can I support your safety or integration today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Fix: Follow @google/genai guidelines for initializing client instance right before use
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: `You are FacilitatorAI, an advanced chatbot acting as a psychedelic integration partner. 
          Your primary knowledge base is the "Dr. Leary Psychedelic Integration Partner" RAG database 
          (Source: https://storage.cloud.google.com/ai-studio-bucket-572556903588-us-west1/services/dr-leary-psychedelic-integration-partner/version-1/compiled/index.html).
          
          Guidelines:
          1. Provide evidence-based, supportive, and non-judgmental harm reduction advice.
          2. Prioritize safety protocols above all else.
          3. Use the concept of "Set and Setting" to guide preparation and integration.
          4. Maintain a professional yet empathetic tone, consistent with the "New Psychonaut" quantified-self philosophy.
          5. If asked about medical emergencies, urge immediate professional medical attention.
          6. Your goal is to help users conduct safe, insightful N-of-1 consciousness experiments.`,
        }
      });

      // Fix: Access .text property directly from response
      const responseText = response.text || "I'm having trouble retrieving data from the safety matrix. Please rephrase your query.";
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("FacilitatorAI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Error: Could not reach the FacilitatorAI safety core. Verify your system connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 flex flex-col h-[calc(100vh-14rem)]">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full font-bold text-[10px] tracking-widest uppercase mb-3">
            <ShieldAlert size={12} /> RAG Matrix: DR. LEARY INTEGRATION PARTNER
          </div>
          <h2 className="text-4xl font-bold mb-1 tracking-tight">FacilitatorAI</h2>
          <p className="opacity-60 text-sm uppercase font-bold tracking-widest">New Psychonaut Safety Core</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => setMessages([{ role: 'model', text: "Neural pathways cleared. How can I support your journey today?" }])}
            className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${darkMode ? 'border-zinc-800 hover:bg-zinc-800' : 'border-gray-200 hover:bg-gray-100'}`}
           >
             <RefreshCcw size={14} /> Clear Session
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 overflow-hidden">
        <div className={`lg:col-span-3 flex flex-col rounded-[3rem] border overflow-hidden ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-2xl'}`}>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scroll">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : (darkMode ? 'bg-zinc-800' : 'bg-gray-100')}`}>
                    {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />}
                  </div>
                  <div className={`p-6 rounded-[2rem] text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
                      : (darkMode ? 'bg-zinc-800 text-zinc-100 rounded-tl-none' : 'bg-gray-50 text-gray-800 rounded-tl-none')
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                    <Loader2 size={20} className="animate-spin text-blue-500" />
                  </div>
                  <div className={`p-6 rounded-[2rem] ${darkMode ? 'bg-zinc-800' : 'bg-gray-50'}`}>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className={`p-6 border-t ${darkMode ? 'border-zinc-800 bg-zinc-950/50' : 'border-gray-100 bg-gray-50/50'}`}>
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Query the safety matrix..."
                className={`w-full p-5 pr-16 rounded-[1.5rem] border outline-none transition-all ${
                  darkMode ? 'bg-zinc-900 border-zinc-800 focus:border-blue-500 text-white' : 'bg-white border-gray-200 focus:border-black text-black'
                }`}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-3 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-md'}`}>
            <h3 className="font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px] opacity-40"><Heart className="text-red-500 fill-red-500" size={14} /> Safety Core</h3>
            <ul className="space-y-4 text-xs opacity-70 leading-relaxed">
              <li className="flex gap-3"><span className="text-blue-500 font-bold">•</span> Prioritize hydration/nutrition.</li>
              <li className="flex gap-3"><span className="text-blue-500 font-bold">•</span> Utilize familiar environments for high-dose flights.</li>
              <li className="flex gap-3"><span className="text-blue-500 font-bold">•</span> Establish grounding protocols.</li>
            </ul>
          </div>

          <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-blue-900/10 border-blue-900/20' : 'bg-blue-50 border-blue-100'}`}>
            <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-600 uppercase tracking-widest text-[10px]"><Info size={14} /> RAG Sources</h3>
            <div className="space-y-3">
              <a href="https://newpsychonaut.com" target="_blank" rel="noreferrer" className="block text-xs font-bold text-blue-600 hover:underline">Dr. Leary Integration v1</a>
              <a href="#" className="block text-xs font-bold text-blue-600 hover:underline">Harm Reduction Database</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
