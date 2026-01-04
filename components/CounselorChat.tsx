
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
    { role: 'model', text: `안녕하세요! 분석 결과를 보시고 궁금한 점이 생기셨나요? 무엇이든 편하게 물어보세요.` }
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
    const newMessages: Message[] = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      // 대화 기록을 Gemini API 규격에 맞춰 변환
      const contents = newMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const requestBody = {
        contents,
        system_instruction: {
          parts: [{ text: `당신은 분석 결과(${result.summary})를 바탕으로 내담자의 마음을 따뜻하게 공감해주는 미술 치료 상담사입니다. 한국어로 친절하게 답변하세요.` }]
        }
      };

      const response = await fetch("/api/gemini?model=gemini-3-pro-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("서버 응답 오류");

      const data = await response.json();
      const modelText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (modelText) {
        setMessages(prev => [...prev, { role: 'model', text: modelText }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'model', text: "죄송합니다. 일시적인 연결 오류가 발생했습니다." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg h-[80vh] sm:h-[600px] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
        <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot size={24} />
            <div>
              <h3 className="font-bold">마인드 가이드</h3>
              <p className="text-xs opacity-80">AI 심리 상담사</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-white shadow-sm'}`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isTyping && <div className="text-slate-400 text-xs animate-pulse ml-11">상담사가 답변을 작성 중입니다...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="메시지를 입력하세요..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3"
            />
            <button onClick={handleSend} disabled={!input.trim() || isTyping} className="p-3 bg-indigo-600 text-white rounded-xl disabled:opacity-50">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorChat;
