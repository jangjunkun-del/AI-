
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, X, Loader2 } from 'lucide-react';
import { AnalysisResult } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface CounselorChatProps {
  result: AnalysisResult;
  onClose: () => void;
}

const CounselorChat: React.FC<CounselorChatProps> = ({ result, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `안녕하세요! 분석 결과를 바탕으로 더 궁금하신 점이 있다면 편하게 말씀해 주세요.` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          contextResult: result
        })
      });

      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'model', text: data.text }]);
      } else {
        throw new Error();
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "잠시 연결이 원활하지 않네요. 다시 시도해 주시겠어요?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg h-[80vh] sm:h-[600px] rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
        <div className="bg-indigo-600 p-7 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-xl"><Bot size={24} /></div>
            <div>
              <h3 className="font-bold text-lg">마음 가이드</h3>
              <p className="text-xs opacity-70">실시간 AI 심리 상담</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={28} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-slate-100 ${msg.role === 'user' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-400'}`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none font-medium'}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isTyping && <div className="text-slate-400 text-xs animate-pulse ml-12 flex items-center gap-2 font-bold"><Loader2 size={12} className="animate-spin" /> 상담사가 생각 중입니다...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="상담사에게 물어보세요..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 py-2"
            />
            <button onClick={handleSend} disabled={!input.trim() || isTyping} className="p-3 bg-indigo-600 text-white rounded-2xl disabled:opacity-30 transition-all shadow-md">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorChat;
