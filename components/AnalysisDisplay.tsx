
import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Brain, Heart, Sparkles, AlertCircle, Quote, Download, MessageCircle } from 'lucide-react';
import { AnalysisResult } from '../types';
import CounselorChat from './CounselorChat';

interface AnalysisDisplayProps {
  result: AnalysisResult;
  onRestart: () => void;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, onRestart }) => {
  const [showChat, setShowChat] = useState(false);

  const saveAsImage = () => {
    window.print();
  };

  return (
    <div id="capture-area" className="max-w-4xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      {/* Header Summary */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
              {new Date(result.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <div className="flex gap-2 no-print">
              <button onClick={saveAsImage} title="저장하기" className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><Download size={20}/></button>
            </div>
          </div>
          <h2 className="text-4xl font-black mb-6 leading-tight">
            마인드스케치 분석 결과
          </h2>
          <div className="flex gap-4 items-start bg-black/20 p-8 rounded-[2rem] backdrop-blur-md border border-white/10">
            <Quote size={28} className="opacity-40 shrink-0 rotate-180" />
            <p className="text-2xl font-medium leading-relaxed italic">
              {result.summary}
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personality Radar */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col">
          <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <Brain className="text-indigo-500" /> 성격 지표
          </h3>
          <div className="h-[300px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={result.personalityTraits}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="trait" stroke="#94a3b8" tick={{ fontSize: 13, fontWeight: 600 }} />
                <Radar
                  name="점수"
                  dataKey="score"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotional State */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
          <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <Heart className="text-pink-500" /> 감정 상태
          </h3>
          <p className="text-slate-600 leading-relaxed text-lg mb-8 font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100">
            {result.emotionalState}
          </p>
          
          <div className="space-y-4">
            <h4 className="font-bold text-indigo-600 text-sm uppercase tracking-widest">Key Insights</h4>
            <div className="grid grid-cols-1 gap-3">
              {result.keyInsights.map((insight, i) => (
                <div key={i} className="flex items-center gap-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 group hover:bg-indigo-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-indigo-500 shadow-sm shrink-0">{i+1}</div>
                  <span className="text-slate-700 font-semibold">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advice Section */}
      <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-400 rounded-2xl"><AlertCircle className="text-slate-900" /></div>
              <h3 className="text-2xl font-black">AI 심리 가이드</h3>
            </div>
            <button
              onClick={() => setShowChat(true)}
              className="no-print hidden sm:flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 font-bold"
            >
              <MessageCircle size={20} /> 상담사와 대화하기
            </button>
          </div>
          <p className="text-slate-300 text-xl leading-relaxed font-light">
            {result.advice}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
      </section>

      {/* Floating Chat Trigger for Mobile */}
      <div className="fixed bottom-8 right-8 z-40 no-print sm:hidden">
        <button
          onClick={() => setShowChat(true)}
          className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce hover:scale-110 active:scale-95 transition-all"
        >
          <MessageCircle size={28} />
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 no-print">
        <button
          onClick={() => setShowChat(true)}
          className="sm:hidden px-12 py-5 bg-indigo-100 text-indigo-700 font-black text-lg rounded-[2rem] transition-all"
        >
          상담사와 더 대화하기
        </button>
        <button
          onClick={onRestart}
          className="px-12 py-5 bg-slate-900 text-white font-black text-lg rounded-[2rem] hover:bg-indigo-600 transition-all shadow-2xl hover:scale-105 active:scale-95"
        >
          새로운 테스트 시작
        </button>
      </div>

      {/* AI Counselor Chat Modal */}
      {showChat && (
        <CounselorChat result={result} onClose={() => setShowChat(false)} />
      )}

      <p className="text-center text-slate-400 text-sm mt-8 no-print">
        이 결과는 사용자의 그림을 기반으로 생성된 AI 분석입니다.<br/>
        더 깊은 상담을 원하시면 전문가와 상의해 보세요.
      </p>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          #capture-area { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default AnalysisDisplay;
