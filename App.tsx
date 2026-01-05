import React, { useState, useEffect } from 'react';
import { Sparkles, Palette, ArrowRight, Loader2, Share2, Info, History, Trash2, Key } from 'lucide-react';
import DrawingBoard from './components/DrawingBoard';
import AnalysisDisplay from './components/AnalysisDisplay';
import { TestStep, DrawingData, AnalysisResult } from './types';
import { analyzeDrawings } from './services/geminiService';

// The aistudio object and its methods are provided by the environment.
// Redundant declarations removed to resolve duplicate identifier and modifier mismatch errors.

const App: React.FC = () => {
  const [step, setStep] = useState<TestStep>('intro');
  const [drawings, setDrawings] = useState<DrawingData>({});
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isKeySelected, setIsKeySelected] = useState<boolean | null>(null); // null: checking, false: need selection

  useEffect(() => {
    const checkKeyStatus = async () => {
      // @ts-ignore - aistudio is globally provided by the environment
      if (window.aistudio) {
        try {
          // @ts-ignore
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setIsKeySelected(hasKey);
        } catch (e) {
          console.error("API 키 상태 확인 실패:", e);
          setIsKeySelected(false);
        }
      } else {
        // AI Studio 환경이 아닐 경우 (로컬 개발 등)
        setIsKeySelected(!!process.env.API_KEY);
      }
    };
    checkKeyStatus();

    const saved = localStorage.getItem('mindsketch_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleOpenKeySelection = async () => {
    // @ts-ignore
    if (window.aistudio) {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        // 가이드라인: 키 선택 트리거 후 즉시 성공으로 가정하고 앱 진입
        setIsKeySelected(true);
      } catch (e) {
        console.error("키 선택창 열기 실패:", e);
      }
    }
  };

  const changeStep = (newStep: TestStep) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(newStep);
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

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

  const startTest = () => {
    setDrawings({});
    setResult(null);
    setError(null);
    changeStep('house');
  };

  const handlePersonComplete = async (img: string) => {
    const updatedDrawings = { ...drawings, person: img };
    setDrawings(updatedDrawings);
    changeStep('analyzing');
    setError(null);

    try {
      const analysis = await analyzeDrawings(updatedDrawings);
      const finalResult: AnalysisResult = {
        ...analysis,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };
      setResult(finalResult);
      saveToHistory(finalResult);
      changeStep('result');
    } catch (err: any) {
      console.error("Analysis failed:", err);
      const msg = err.message || "";
      setError(msg || "심리 분석 중 예상치 못한 오류가 발생했습니다.");
      
      // 구체적인 키 누락 에러 감지 (SDK 메시지 포함)
      if (
        msg.includes("API key is missing") || 
        msg.includes("API Key must be set") ||
        msg.includes("Requested entity was not found")
      ) {
        setIsKeySelected(false);
      }
      
      changeStep('intro');
    }
  };

  // 초기 로딩 중
  if (isKeySelected === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  // API 키 미선택 시 노출될 UI
  if (!isKeySelected) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
            <Key size={40} className="animate-pulse" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-900 leading-tight">심리 분석 엔진 연결</h2>
            <p className="text-slate-500 font-medium break-keep text-base leading-relaxed px-2">
              정확한 HTP 심리 분석을 위해 Gemini AI 키를 연결해야 합니다.<br/>
              유료 프로젝트의 API 키를 선택해 주세요.
            </p>
          </div>
          <div className="space-y-4 pt-4">
            <button 
              onClick={handleOpenKeySelection}
              className="w-full py-5 bg-indigo-600 text-white font-black text-xl rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
            >
              지금 API 키 선택하기
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-sm text-indigo-500 font-bold hover:underline"
            >
              결제 및 API 키 안내 (Google AI Studio)
            </a>
          </div>
        </div>
      </div>
    );
  }

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 space-y-12 animate-in fade-in zoom-in duration-1000">
      <div className="relative">
        <div className="w-48 h-48 border-[16px] border-indigo-50 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <Palette size={56} className="text-indigo-500 animate-pulse" />
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">당신의 마음을 읽고 있습니다</h2>
        <p className="text-slate-500 text-xl max-w-sm mx-auto leading-relaxed break-keep font-medium">
          그림 속에 담긴 무의식의 기호들을 AI가 심도 있게 분석 중입니다.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/30 flex flex-col selection:bg-indigo-100">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-slate-100 px-6 py-5 sm:px-12 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => changeStep('intro')}>
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-100 group-hover:rotate-12 transition-transform">
              <Palette className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">마인드스케치</h1>
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">MindSketch AI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button onClick={() => changeStep('history')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${step === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 shadow-sm'}`}>
                <History size={16} /> <span className="hidden sm:inline">나의 이력</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className={`flex-1 container mx-auto px-4 pb-24 transition-all duration-500 ease-in-out ${isTransitioning ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
        {error && (
          <div className="max-w-xl mx-auto mt-8 p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-[2rem] text-sm flex items-start gap-4 animate-in slide-in-from-top-4 font-bold shadow-md">
            <Info size={24} className="shrink-0 mt-0.5" /> 
            <div className="flex-1">
              <p className="text-base mb-1">분석 중 오류가 발생했습니다:</p>
              <p className="opacity-80 font-mono text-xs bg-white/50 p-2 rounded-lg break-all">{error}</p>
            </div>
          </div>
        )}

        {step === 'intro' && (
          <div className="max-w-5xl mx-auto space-y-24 py-16 md:py-32">
            <div className="text-center space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <div className="inline-block px-8 py-2.5 bg-indigo-50 text-indigo-600 text-[11px] font-black rounded-full uppercase tracking-[0.3em] border border-indigo-100 shadow-sm">Advanced AI Art Therapy</div>
              <h2 className="text-5xl md:text-8xl lg:text-[10rem] font-black text-slate-900 leading-[1.15] md:leading-[1.0] tracking-tight break-keep px-4">
                말하지 못한 마음,<br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500">그림에 담다.</span>
              </h2>
              <div className="pt-8">
                <button onClick={startTest} className="group relative px-12 md:px-24 py-6 md:py-10 bg-slate-900 text-white text-2xl md:text-4xl font-black rounded-[2.5rem] md:rounded-[4rem] shadow-xl hover:bg-indigo-600 hover:-translate-y-2 transition-all active:scale-95 flex items-center gap-4 md:gap-8 mx-auto">
                  무료 분석 시작 <ArrowRight size={28} className="md:w-10 md:h-10 group-hover:translate-x-4 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'history' && (
          <div className="max-w-4xl mx-auto space-y-16 py-20 animate-in slide-in-from-right duration-700">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">나의 기록들</h2>
              <button onClick={() => changeStep('intro')} className="px-6 py-3 rounded-2xl bg-white border border-slate-200 font-black text-slate-600">닫기</button>
            </div>
            {history.length === 0 ? (
              <div className="mx-4 text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-100">
                <p className="text-slate-300 text-2xl font-black">아직 분석한 그림이 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
                {history.map(item => (
                  <div key={item.id} onClick={() => { setResult(item); changeStep('result'); }} className="p-12 bg-white rounded-[4rem] border border-slate-50 shadow-2xl hover:border-indigo-200 cursor-pointer transition-all relative group">
                    <h4 className="font-black text-slate-900 line-clamp-2 text-2xl mb-6">{item.summary}</h4>
                    <span className="text-sm font-black text-slate-400">{new Date(item.date).toLocaleDateString()}</span>
                    <button onClick={(e) => deleteHistoryItem(item.id, e)} className="absolute top-10 right-10 p-4 text-slate-200 hover:text-rose-500 transition-all"><Trash2 size={24} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'house' && <DrawingBoard title="집을 그려보세요" instruction="안정성을 보여주는 집을 그려주세요." onComplete={(img) => { setDrawings(p => ({...p, house: img})); changeStep('tree'); }} />}
        {step === 'tree' && <DrawingBoard title="나무를 그려보세요" instruction="에너지를 보여주는 나무를 그려주세요." onComplete={(img) => { setDrawings(p => ({...p, tree: img})); changeStep('person'); }} />}
        {step === 'person' && <DrawingBoard title="사람을 그려보세요" instruction="사회적 자아인 사람을 그려주세요." onComplete={handlePersonComplete} />}
        {step === 'analyzing' && renderLoading()}
        {step === 'result' && result && <AnalysisDisplay result={result} onRestart={startTest} />}
      </main>
    </div>
  );
};

export default App;