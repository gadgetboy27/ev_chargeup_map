import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, ExternalLink, MapPin } from 'lucide-react';
import { searchChargers } from '../services/geminiService';
import { ChatMessage, Coordinates } from '../types';

interface ChatProps {
  userLocation: Coordinates | null;
}

const ChatAssistant: React.FC<ChatProps> = ({ userLocation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hi! I can help you find charging stations nearby. Try "Find fast chargers near me" or "Cheap chargers in Downtown".' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const response = await searchChargers(input, userLocation?.lat, userLocation?.lng);
    setMessages(prev => [...prev, response]);
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute top-4 right-4 z-[1000] p-3 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-blue-600 hover:bg-blue-500'
        } text-white`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      <div className={`absolute top-20 right-4 w-80 md:w-96 bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl z-[1000] flex flex-col transition-all duration-300 origin-top-right overflow-hidden ${
        isOpen ? 'opacity-100 scale-100 h-[60vh]' : 'opacity-0 scale-95 h-0 pointer-events-none'
      }`}>
        {/* Header */}
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <span className="text-blue-400">◆</span> VoltLink AI Assistant
          </h3>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
              }`}>
                {msg.text}
                
                {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-600 space-y-1">
                    <p className="text-xs text-gray-400 font-bold mb-1">Sources:</p>
                    {msg.groundingUrls.map((url, idx) => (
                      <a 
                        key={idx} 
                        href={url.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block text-xs text-blue-300 hover:text-blue-200 truncate flex items-center gap-1"
                      >
                        <ExternalLink size={10} /> {url.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="bg-gray-800 rounded-2xl p-3 rounded-bl-none border border-gray-700">
                 <div className="flex space-x-1">
                   <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                   <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                   <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-gray-800 border-t border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about chargers..."
              className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-blue-500"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatAssistant;