
import React, { useState, useEffect } from 'react';
import { Sparkles, Palette, ArrowRight, Loader2, CloudRain, Sun, Wind, History, Trash2, Calendar, Share2, Info } from 'lucide-react';
import DrawingBoard from './components/DrawingBoard';
import AnalysisDisplay from './components/AnalysisDisplay';
import { TestStep, DrawingData, AnalysisResult } from './types';
import { analyzeDrawings } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<TestStep>('intro');
  const [drawings, setDrawings] = useState<DrawingData>({});
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mindsketch_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (newResult: AnalysisResult) => {
    const updated = [newResult, ...history].slice(0, 20);
    setHistory(updated);
    localStorage.setItem('mindsketch_history', JSON.stringify(updated));
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('mindsketch_history', JSON.stringify(updated));
  };

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '마인드스케치 - AI 그림 심리 분석',
          text: '그림을 통해 나의 심리 상태를 분석해보세요!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다. 친구에게 전달해 보세요!');
    }
  };

  const startTest = () => {
    setStep('house');
    setDrawings({});
    setResult(null);
    setError(null);
  };

  const handlePersonComplete = async (img: string) => {
    const updatedDrawings = { ...drawings, person: img };
    setDrawings(updatedDrawings);
    setStep('analyzing');

    try {
      const analysis = await analyzeDrawings(updatedDrawings);
      const finalResult: AnalysisResult = {
        ...analysis,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };
      setResult(finalResult);
      saveToHistory(finalResult);
      setStep('result');
    } catch (err) {
      setError("심리 분석 엔진에 연결할 수 없습니다. 다시 시도해 주세요.");
      setStep('intro');
    }
  };

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="relative">
        <div className="w-32 h-32 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <Palette size={40} className="text-indigo-600 animate-pulse" />
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">마음의 지도를 그리는 중</h2>
        <p className="text-slate-500 text-lg max-w-sm mx-auto leading-relaxed">
          당신이 선택한 색채와 선의 흐름 속에서<br/>숨겨진 감정의 조각들을 찾고 있습니다.
        </p>
      </div>
      <div className="flex gap-6">
        <CloudRain className="text-indigo-300 animate-bounce" />
        <Sun className="text-amber-400 animate-bounce delay-150" />
        <Wind className="text-sky-300 animate-bounce delay-300" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 sm:px-12 sm:py-6 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setStep('intro')}>
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100 group-hover:rotate-12 transition-transform">
              <Palette className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">마인드스케치</h1>
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">MindSketch AI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={shareApp} 
              className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="친구에게 공유하기"
            >
              <Share2 size={22} />
            </button>
            {history.length > 0 && (
              <button 
                onClick={() => setStep('history')} 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${step === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <History size={18} className="hidden sm:inline" /> {step === 'history' ? '목록' : '나의 이력'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 pb-20">
        {error && (
          <div className="max-w-md mx-auto mt-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-center gap-3">
            <Info size={18} /> {error}
          </div>
        )}

        {step === 'intro' && (
          <div className="max-w-4xl mx-auto space-y-16 py-12">
            <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="inline-block px-5 py-2 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full uppercase tracking-[0.15em] border border-indigo-100">
                AI 기반 심리 솔루션
              </div>
              <h2 className="text-5xl md:text-8xl font-black text-slate-900 leading-[1.05] tracking-tight break-keep">
                말하지 못한<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">진심</span>을 마주하다
              </h2>
              <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed break-keep font-medium">
                그림 한 점에 담긴 당신의 무의식.<br/>
                전문적인 HTP 테스트를 통해 더 깊은 나를 발견해보세요.
              </p>
              
              <div className="pt-6">
                <button
                  onClick={startTest}
                  className="group relative px-16 py-7 bg-slate-900 text-white text-2xl font-black rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.25)] hover:bg-indigo-600 hover:-translate-y-2 transition-all active:scale-95 flex items-center gap-5 mx-auto overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  테스트 시작 <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: "Home", title: "나의 자아, 집", desc: "가정 환경과 핵심 자아상을 투영합니다.", color: "text-blue-600", bg: "bg-blue-50" },
                { step: "Tree", title: "무의식, 나무", desc: "성장 에너지와 내적 생명력을 확인합니다.", color: "text-emerald-600", bg: "bg-emerald-50" },
                { step: "Person", title: "페르소나, 사람", desc: "사회적 관계와 신체적 이미지를 읽습니다.", color: "text-purple-600", bg: "bg-purple-50" }
              ].map((item, i) => (
                <div key={i} className="p-10 bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transition-all group">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-6 tracking-wider ${item.bg} ${item.color}`}>{item.step}</span>
                  <h4 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                  <p className="text-slate-500 text-base leading-relaxed break-keep">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'history' && (
          <div className="max-w-4xl mx-auto space-y-10 py-12 animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-black text-slate-900">나의 심리 이력</h2>
              <button onClick={() => setStep('intro')} className="px-6 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">닫기</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {history.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => { setResult(item); setStep('result'); }}
                  className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-xl cursor-pointer transition-all relative group"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl"><Calendar size={20}/></div>
                    <span className="text-sm font-bold text-slate-400">{new Date(item.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <h4 className="font-black text-slate-800 line-clamp-2 text-xl mb-4 leading-snug">{item.summary}</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.personalityTraits.slice(0, 3).map(t => (
                      <span key={t.trait} className="px-3 py-1 bg-slate-50 text-slate-600 text-[11px] font-bold rounded-full border border-slate-100">#{t.trait}</span>
                    ))}
                  </div>
                  <button 
                    onClick={(e) => deleteHistoryItem(item.id, e)}
                    className="absolute top-6 right-6 p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'house' && <DrawingBoard title="집을 그려보세요" instruction="가족 혹은 자신의 내면 세계를 상징하는 집을 그려주세요." onComplete={(img) => { setDrawings(p => ({...p, house: img})); setStep('tree'); }} />}
        {step === 'tree' && <DrawingBoard title="나무를 그려보세요" instruction="무의식적인 성격과 내면의 에너지를 상징하는 나무를 그려주세요." onComplete={(img) => { setDrawings(p => ({...p, tree: img})); setStep('person'); }} />}
        {step === 'person' && <DrawingBoard title="사람을 그려보세요" instruction="사회적 관계 속에서 비춰지는 전신 사람상을 그려주세요." onComplete={handlePersonComplete} />}
        {step === 'analyzing' && renderLoading()}
        {step === 'result' && result && <AnalysisDisplay result={result} onRestart={startTest} />}
      </main>

      <footer className="py-16 text-center text-slate-400 text-xs no-print border-t border-slate-100">
        <div className="flex justify-center gap-6 mb-4">
          <span className="cursor-pointer hover:text-slate-600 transition-colors">이용약관</span>
          <span className="cursor-pointer hover:text-slate-600 transition-colors font-bold text-indigo-500">개인정보처리방침</span>
          <span className="cursor-pointer hover:text-slate-600 transition-colors">문의하기</span>
        </div>
        <p className="font-black mb-1 text-slate-500 tracking-widest uppercase">MindSketch Art Therapy Tool</p>
        <p>&copy; {new Date().getFullYear()} MindSketch. Built with Gemini 3 Flash Pro.</p>
      </footer>
    </div>
  );
};

export default App;
