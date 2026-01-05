
import React, { useState, useEffect } from 'react';
import { Sparkles, Palette, ArrowRight, Loader2, Share2, Info, History, Trash2, Key } from 'lucide-react';
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isKeySelected, setIsKeySelected] = useState<boolean>(true); // 기본값 true, 체크 후 변경

  useEffect(() => {
    const checkKey = async () => {
      // aistudio 환경에서 키 선택 여부 확인
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setIsKeySelected(selected);
      }
    };
    checkKey();

    const saved = localStorage.getItem('mindsketch_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleOpenKeySelection = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setIsKeySelected(true); // 선택 후 즉시 앱 진행
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
      alert('링크가 복사되었습니다!');
    }
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
      setError(err.message || "심리 분석 중 예상치 못한 오류가 발생했습니다.");
      changeStep('intro');
    }
  };

  // API 키가 선택되지 않았을 때 보여줄 화면
  if (!isKeySelected) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight">Gemini AI 연결이 필요합니다</h2>
          <p className="text-slate-500 font-medium break-keep">
            정확한 심리 분석을 위해 Gemini API 키를 연결해주세요. 유료 프로젝트의 API 키가 필요할 수 있습니다.
          </p>
          <div className="space-y-4 pt-4">
            <button 
              onClick={handleOpenKeySelection}
              className="w-full py-5 bg-indigo-600 text-white font-black text-xl rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              API 키 선택하기
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-sm text-indigo-500 font-bold hover:underline"
            >
              결제 및 API 키 안내 보기
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
          선 하나하나에 담긴 당신의 무의식을 분석하고 있습니다.
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
            <button onClick={shareApp} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><Share2 size={20} /></button>
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
              <p className="opacity-80 font-mono text-xs bg-white/50 p-2 rounded-lg">{error}</p>
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
