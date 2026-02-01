import React, { useState, useEffect } from 'react';
import { UploadZone } from './components/UploadZone.tsx';
import { BillPreview } from './components/BillPreview.tsx';
import { scanDocument } from './services/gemini.ts';
import { AppState, ExtractedBillData, HistoryItem } from './types.ts';
import { Scan, Loader2, FileCheck, AlertCircle, FileText, History, Trash2, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [billData, setBillData] = useState<ExtractedBillData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Safe ID generator fallback
  const generateId = () => {
    try {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
    } catch (e) {}
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  };

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('cfd_invoice_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (data: ExtractedBillData) => {
    const newItem: HistoryItem = {
      id: generateId(),
      timestamp: Date.now(),
      data: data
    };
    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('cfd_invoice_history', JSON.stringify(updatedHistory));
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('cfd_invoice_history', JSON.stringify(updatedHistory));
  };

  const clearAllHistory = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      setHistory([]);
      localStorage.removeItem('cfd_invoice_history');
    }
  };

  const handleFileSelect = (file: File) => {
    const type = file.type;
    setMimeType(type);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreviewImage(base64String);
      processFile(base64String, type);
    };
    reader.readAsDataURL(file);
  };

  const processFile = async (base64String: string, type: string) => {
    setAppState(AppState.SCANNING);
    setErrorMsg(null);
    
    try {
      const base64Content = base64String.split(',')[1];
      const data = await scanDocument(base64Content, type);
      setBillData(data);
      saveToHistory(data);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      setAppState(AppState.ERROR);
      setErrorMsg(err instanceof Error ? err.message : "Failed to process document.");
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setPreviewImage(null);
    setMimeType(null);
    setBillData(null);
    setErrorMsg(null);
  };

  const openHistoryItem = (item: HistoryItem) => {
    setBillData(item.data);
    setAppState(AppState.SUCCESS);
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={handleReset}
            >
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Scan className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">CFD Invoice</span>
            </div>

            <button 
              onClick={() => setAppState(appState === AppState.HISTORY ? AppState.IDLE : AppState.HISTORY)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                appState === AppState.HISTORY 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <History size={18} />
              <span className="font-medium hidden sm:inline">History</span>
              {history.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  appState === AppState.HISTORY ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* State: HISTORY */}
        {appState === AppState.HISTORY && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <History className="text-indigo-600" /> Recent Scans
              </h2>
              {history.length > 0 && (
                <button 
                  onClick={clearAllHistory}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <Trash2 size={14} /> Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-gray-300" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No history yet</h3>
                <p className="text-gray-500 mb-6">Scanned invoices will appear here for quick access.</p>
                <button 
                  onClick={handleReset}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Start Scanning
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => openHistoryItem(item)}
                    className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FileText size={24} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                          {item.data.sender.name || 'Unknown Merchant'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span>{item.data.date || 'No Date'}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{item.data.documentType || 'Invoice'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="font-bold text-indigo-600">{item.data.currency} {item.data.totalAmount}</div>
                        <div className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button 
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                        <ChevronRight className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* State: IDLE */}
        {appState === AppState.IDLE && (
          <>
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4 tracking-tight">
                Turn Paper Bills into <span className="text-indigo-600">Digital Data</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload an image or PDF. Our AI will instantly analyze, extract, and format it into a clean CFD Invoice record.
              </p>
            </div>
            <UploadZone onFileSelect={handleFileSelect} />
          </>
        )}

        {/* State: SCANNING */}
        {appState === AppState.SCANNING && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="relative">
                <div className="w-48 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative mb-8 bg-gray-100 flex items-center justify-center">
                    {mimeType === 'application/pdf' ? (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                           <FileText className="w-16 h-16 mb-2" />
                           <span className="text-xs font-medium uppercase tracking-widest">PDF Document</span>
                        </div>
                    ) : (
                        previewImage && <img src={previewImage} alt="Scanning" className="w-full h-full object-cover opacity-50" />
                    )}
                    <div className="absolute inset-0 bg-indigo-500/10"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] animate-scan"></div>
                </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Document...</h2>
            <p className="text-gray-500 mb-6">Using Gemini AI to extract billing details.</p>
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        )}

        {/* State: SUCCESS */}
        {appState === AppState.SUCCESS && billData && (
          <div className="animate-fade-in">
             <div className="flex items-center justify-center gap-2 mb-8 text-green-600 bg-green-50 w-fit mx-auto px-4 py-2 rounded-full border border-green-100">
                <FileCheck size={18} />
                <span className="font-semibold text-sm">Extraction Successful</span>
             </div>
             <BillPreview data={billData} onReset={handleReset} />
          </div>
        )}

        {/* State: ERROR */}
        {appState === AppState.ERROR && (
          <div className="max-w-md mx-auto text-center py-12 animate-fade-in">
            <div className="bg-red-50 p-4 rounded-full inline-flex mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Scan Failed</h3>
            <p className="text-gray-600 mb-6">{errorMsg}</p>
            <button 
                onClick={handleReset}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
            >
                Try Again
            </button>
          </div>
        )}

      </main>

       <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-scan {
          animation: scan 2.5s ease-in-out infinite;
        }
        .animate-fade-in {
            animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;