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
    <div id="capture-area" className="max-w-6xl mx-auto p-4 space-y-16 pb-48 animate-in fade-in slide-in-from-bottom-16 duration-1000">
      {/* Header Summary Card */}
      <section className="bg-slate-900 rounded-[5rem] p-16 text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-rose-500/20"></div>
        <div className="relative z-10 space-y-12">
          <div className="flex flex-wrap justify-between items-center gap-6">
            <span className="bg-white/10 backdrop-blur-2xl px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.3em] border border-white/10 text-indigo-300">
              Analysis ID: #{result.id.slice(-6)} • {new Date(result.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <div className="flex gap-4 no-print">
              <button onClick={saveAsImage} title="저장하기" className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl transition-all border border-white/5 active:scale-90"><Download size={24}/></button>
            </div>
          </div>
          <h2 className="text-6xl md:text-8xl font-black mb-10 leading-[0.9] tracking-tighter">
            내 마음의 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">색깔</span>
          </h2>
          <div className="flex gap-8 items-start bg-white/5 p-12 rounded-[3.5rem] backdrop-blur-md border border-white/10 shadow-2xl">
            <Quote size={48} className="text-indigo-400 shrink-0 opacity-40 rotate-180" />
            <p className="text-3xl md:text-4xl font-black leading-[1.3] break-keep text-indigo-50">
              {result.summary}
            </p>
          </div>
        </div>
      </section>

      {/* Main Analysis Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Personality Radar Column */}
        <div className="lg:col-span-5 bg-white rounded-[4rem] p-12 shadow-2xl shadow-slate-100 border border-slate-50 flex flex-col items-center">
          <h3 className="text-3xl font-black text-slate-900 mb-12 flex items-center gap-5 self-start">
            <div className="p-4 bg-indigo-50 rounded-[1.5rem]"><Brain className="text-indigo-600" size={28} /></div>
            성격 지형도
          </h3>
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={result.personalityTraits}>
                <PolarGrid stroke="#f1f5f9" strokeWidth={2} />
                <PolarAngleAxis dataKey="trait" stroke="#94a3b8" tick={{ fontSize: 14, fontWeight: 900 }} />
                <Radar
                  name="점수"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={4}
                  fill="#6366f1"
                  fillOpacity={0.1}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-base text-slate-400 text-center mt-10 font-bold max-w-xs leading-relaxed">
            당신의 자아 구조를 구성하는 주요 심리적 기제들의 분포입니다.
          </p>
        </div>

        {/* Emotional State Column */}
        <div className="lg:col-span-7 space-y-12">
          <div className="bg-white rounded-[4rem] p-12 shadow-2xl shadow-slate-100 border border-slate-50 h-full">
            <h3 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-5">
              <div className="p-4 bg-rose-50 rounded-[1.5rem]"><Heart className="text-rose-500" size={28} /></div>
              감정 보고서
            </h3>
            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 mb-12">
              <p className="text-slate-700 leading-relaxed text-2xl font-bold break-keep">
                {result.emotionalState}
              </p>
            </div>
            
            <div className="space-y-8">
              <h4 className="font-black text-indigo-500 text-xs uppercase tracking-[0.4em] ml-4">Core Insights</h4>
              <div className="grid grid-cols-1 gap-6">
                {result.keyInsights.map((insight, i) => (
                  <div key={i} className="flex items-center gap-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/20 transition-all group">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-xl font-black text-indigo-600 shadow-sm shrink-0 group-hover:scale-110 transition-transform">{i+1}</div>
                    <span className="text-slate-800 font-black text-2xl leading-tight">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Advice Section - 세로 배치로 개선 */}
      <section className="bg-indigo-600 rounded-[5rem] p-16 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_50%)]"></div>
        <div className="relative z-10 flex flex-col items-center gap-12 text-center">
          <div className="space-y-10 max-w-4xl">
            <div className="flex flex-col items-center gap-6">
              <div className="p-6 bg-white rounded-[2rem] shadow-2xl rotate-3 group-hover:rotate-0 transition-transform w-fit">
                <AlertCircle className="text-indigo-600" size={48} />
              </div>
              <h3 className="text-5xl font-black tracking-tight">마음 가이드</h3>
            </div>
            <p className="text-indigo-50 text-3xl leading-relaxed font-black break-keep">
              {result.advice}
            </p>
          </div>
          
          <button
            onClick={() => setShowChat(true)}
            className="no-print px-16 py-8 bg-slate-900 text-white hover:bg-black rounded-[2.5rem] transition-all font-black text-2xl shadow-2xl active:scale-95 flex items-center gap-5 group/btn"
          >
            <MessageCircle size={32} className="group-hover/btn:scale-110 transition-transform" />
            AI 상담사와 대화하기
          </button>
        </div>
      </section>

      {/* Floating Action for Mobile */}
      <div className="fixed bottom-12 right-12 z-50 no-print lg:hidden">
        <button
          onClick={() => setShowChat(true)}
          className="w-24 h-24 bg-indigo-600 text-white rounded-full shadow-[0_30px_60px_-10px_rgba(79,70,229,0.5)] flex items-center justify-center animate-bounce hover:scale-110 active:scale-90 transition-all"
        >
          <MessageCircle size={40} />
        </button>
      </div>

      {/* Footer Buttons */}
      <div className="flex flex-col sm:flex-row gap-8 justify-center pt-16 no-print">
        <button
          onClick={onRestart}
          className="px-24 py-10 bg-slate-900 text-white font-black text-2xl rounded-[3rem] hover:bg-indigo-600 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-5"
        >
          <Sparkles size={32} /> 새로운 여정 시작하기
        </button>
      </div>

      {showChat && (
        <CounselorChat result={result} onClose={() => setShowChat(false)} />
      )}

      <p className="text-center text-slate-400 text-base mt-20 no-print font-bold leading-relaxed max-w-2xl mx-auto opacity-60">
        이 리포트는 AI 기반 분석입니다. 현재의 마음 상태를 탐색하는 도구로 활용하시되, 심각한 고민은 전문 심리상담사와 나누시길 권장합니다.
      </p>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          #capture-area { padding: 0 !important; margin: 0 !important; max-width: 100% !important; space-y: 20px !important; }
          section { border-radius: 0 !important; box-shadow: none !important; color: black !important; background: white !important; border: 2px solid #eee !important; }
          h2, h3, h4, p, span { color: black !important; }
          .bg-slate-900 { background: white !important; border: 2px solid black !important; }
          .bg-indigo-600 { background: #f8fafc !important; border: 2px solid #4f46e5 !important; }
          .text-white { color: black !important; }
        }
      `}</style>
    </div>
  );
};

export default AnalysisDisplay;