
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, X, Loader2 } from 'lucide-react';
import { AnalysisResult } from '../types';
import { GoogleGenAI } from "@google/genai";

interface CounselorChatProps {
  result: AnalysisResult;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const CounselorChat: React.FC<CounselorChatProps> = ({ result, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `안녕하세요! 분석 결과를 보시고 궁금한 점이 생기셨나요? 무엇이든 편하게 물어보세요. 제가 곁에서 함께 고민해 드릴게요.` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      // Initialize Gemini SDK with API key from environment
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Use generateContent to handle conversation history with a system instruction
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: newMessages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: `당신은 분석 결과(${result.summary})를 바탕으로 내담자의 마음을 따뜻하게 공감해주고 위로해주는 미술 치료 상담사입니다. 답변은 한국어로 친절하게 작성하세요.`
        }
      });

      const modelText = response.text;

      if (modelText) {
        setMessages(prev => [...prev, { role: 'model', text: modelText }]);
      } else {
        throw new Error("응답을 받지 못했습니다.");
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: `죄송해요, 오류가 발생했어요: ${error.message}. 잠시 후 다시 시도해 주세요.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg h-[80vh] sm:h-[600px] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
        {/* Chat Header */}
        <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-bold">마인드 가이드</h3>
              <p className="text-xs text-indigo-100">AI 심리 상담사</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-indigo-600 shadow-sm'}`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'}`}>
                  {msg.text || (isTyping && idx === messages.length - 1 ? <Loader2 className="animate-spin" size={16} /> : '')}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="상담사에게 메시지를 남겨보세요..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 px-3 py-2 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorChat;
