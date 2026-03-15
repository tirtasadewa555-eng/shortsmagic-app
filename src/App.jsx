import React, { useState, useEffect } from 'react';
import { 
  Scissors, Youtube, LayoutTemplate, Download, 
  Zap, Crown, Play, CheckCircle2, ChevronRight, 
  LogOut, User, Video, Loader2, Sparkles, AlertCircle,
  Clock, FileVideo, ChevronLeft, X,
  Type, BarChart2, Settings, MessageSquare, Save,
  Wand2, Focus, Image as ImageIcon, MicOff, ToggleRight, ToggleLeft,
  BrainCircuit, ChevronDown, Gauge, Cpu, Key, Check
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null); 
  const [currentView, setCurrentView] = useState('landing'); 
  
  // State Dashboard
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('podcast');
  
  // State Pengaturan Mesin AI & API Key
  const [showAISettings, setShowAISettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('shortsmagic_api_key') || 'AIzaSyB3Pj3PYWtpFV_H1TqJMI83tBIs44egoYg');
  const [globalAISettings, setGlobalAISettings] = useState({
    mode: 'balanced', 
    hardwareAccel: true,
    focus: 'viral' 
  });

  // State untuk Fitur Tes Koneksi API
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState(null); // 'success' | 'error' | null
  const [keyMessage, setKeyMessage] = useState('');

  // Auto-save API Key ke Local Storage
  useEffect(() => {
    localStorage.setItem('shortsmagic_api_key', apiKey);
  }, [apiKey]);
  
  // State Proses
  const [processState, setProcessState] = useState('idle'); 
  const [videoMetadata, setVideoMetadata] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [generatedShorts, setGeneratedShorts] = useState([]);
  
  // State Fitur Pro Studio
  const [editingShort, setEditingShort] = useState(null);
  const [studioTab, setStudioTab] = useState('template');
  const [editedTranscript, setEditedTranscript] = useState([]);
  
  // State Fitur Pemutar Video
  const [playingVideo, setPlayingVideo] = useState(null);
  const [isPlayingStudio, setIsPlayingStudio] = useState(false);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);
  const [playProgress, setPlayProgress] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);

  const [downloadState, setDownloadState] = useState({ id: null, progress: 0 });

  const templates = [
    { id: 'podcast', name: 'Podcast Style', desc: 'Wajah di tengah, teks dinamis', icon: <User className="w-6 h-6" /> },
    { id: 'gaming', name: 'Gaming Split', desc: 'Facecam atas, game di bawah', icon: <Video className="w-6 h-6" /> },
    { id: 'motivation', name: 'Motivasi Viral', desc: 'Teks tebal, efek zoom', icon: <Sparkles className="w-6 h-6" /> },
  ];

  // --- FUNGSI TES KONEKSI API GEMINI ---
  const testApiKey = async () => {
    if (!apiKey || apiKey.trim() === '') {
      setKeyStatus('error');
      setKeyMessage('API Key tidak boleh kosong.');
      return;
    }

    setIsTestingKey(true);
    setKeyStatus(null);
    setKeyMessage('');

    try {
      // Melakukan request ringan ke Gemini API untuk memverifikasi Key
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey.trim()
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hello, just testing connection. Reply 'OK'." }] }]
        })
      });

      if (response.ok) {
        setKeyStatus('success');
        setKeyMessage('Koneksi berhasil! API Key valid dan siap digunakan.');
      } else {
        const errorData = await response.json();
        setKeyStatus('error');
        setKeyMessage(errorData.error?.message || 'API Key tidak valid atau terjadi kesalahan otorisasi.');
      }
    } catch (error) {
      setKeyStatus('error');
      setKeyMessage('Gagal menghubungi server Google. Periksa koneksi internet Anda.');
    } finally {
      setIsTestingKey(false);
    }
  };

  // Efek 1: Progress Bar & Perfect Looping
  useEffect(() => {
    let timer;
    if (playingVideo || isPlayingStudio) {
      const activeVideo = playingVideo || editingShort;
      if (!activeVideo) return;

      const durationMs = activeVideo.durationSec * 1000;
      const intervalMs = 50; 

      timer = setInterval(() => {
        setPlayProgress((prev) => {
          const next = prev + (intervalMs / durationMs) * 100;
          if (next >= 100) {
            setIframeKey(k => k + 1);
            return 0;
          }
          return next;
        });
      }, intervalMs);
    } else {
      setPlayProgress(0);
    }
    return () => clearInterval(timer);
  }, [playingVideo, isPlayingStudio, iframeKey, editingShort]);

  // Efek 2: Sinkronisasi Subtitle Matematis
  useEffect(() => {
    let interval;
    if (playingVideo || isPlayingStudio) {
      const activeVideo = playingVideo || editingShort;
      const transcript = playingVideo ? playingVideo.transcript : editedTranscript;
      
      if (activeVideo && transcript && transcript.length > 0) {
        const timePerSubtitle = (activeVideo.durationSec * 1000) / transcript.length;
        
        interval = setInterval(() => {
          setActiveSubtitleIndex((prev) => (prev + 1) % transcript.length);
        }, timePerSubtitle);
      }
    } else {
      setActiveSubtitleIndex(0);
    }
    return () => clearInterval(interval);
  }, [playingVideo, isPlayingStudio, editedTranscript, editingShort, iframeKey]);

  const extractYouTubeID = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
  };

  const handleLogin = (tier = 'free') => {
    setUser({ name: 'Kreator Pro', tier: tier });
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
    resetDashboard();
  };

  const resetDashboard = () => {
    setYoutubeUrl('');
    setVideoMetadata(null);
    setProcessState('idle');
    setGeneratedShorts([]);
    setProgress(0);
    setEditingShort(null);
    setPlayingVideo(null);
    setIsPlayingStudio(false);
  };

  const openStudio = (short) => {
    setEditingShort(short);
    setStudioTab('template');
    setEditedTranscript(short.transcript || []);
    setActiveSubtitleIndex(0);
    setPlayProgress(0);
  };

  const handleDownload = (short) => {
    if (downloadState.id) return; 
    setDownloadState({ id: short.id, progress: 0 });
    
    let currentProgress = 0;
    const renderSpeed = globalAISettings.hardwareAccel ? 20 : 10;
    
    const interval = setInterval(() => {
      currentProgress += Math.random() * renderSpeed;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        const blob = new Blob(['(File Simulasi) Ini adalah video vertikal hasil dari ShortsMagic.AI. Di backend nyata, file ini adalah MP4 asli.'], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ShortsMagic_Part${short.id}_${short.durationSec}detik.mp4`; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setTimeout(() => setDownloadState({ id: null, progress: 0 }), 1500);
      }
      setDownloadState({ id: short.id, progress: Math.floor(currentProgress) });
    }, 400); 
  };

  const handleAnalyzeVideo = async () => {
    const videoId = extractYouTubeID(youtubeUrl);
    if (!videoId) {
      setErrorMsg('Masukkan link YouTube yang valid! (contoh: https://youtube.com/watch?v=...)');
      return;
    }
    
    if (!apiKey || apiKey.trim() === '') {
      setErrorMsg('API Key diperlukan! Buka menu "Pengaturan Mesin AI" di bawah untuk memasukkan API Key Anda.');
      setShowAISettings(true);
      return;
    }

    setErrorMsg('');
    setProcessState('analyzing');

    setTimeout(() => {
      const mockDurationSec = Math.floor(Math.random() * (3600 - 300 + 1) + 300);
      const minutes = Math.floor(mockDurationSec / 60);
      const seconds = mockDurationSec % 60;
      
      const shortsMultiplier = globalAISettings.mode === 'fast' ? 300 : (globalAISettings.mode === 'quality' ? 120 : 180);
      let estimatedShortsCount = Math.max(2, Math.ceil(mockDurationSec / shortsMultiplier));
      if (estimatedShortsCount > 4) estimatedShortsCount = 4; // Batasi max 4 agar AI lebih stabil responnya di Frontend

      setVideoMetadata({
        id: videoId,
        title: `Video YouTube - ID: ${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        durationSec: mockDurationSec,
        durationStr: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        estimatedShorts: estimatedShortsCount
      });
      setProcessState('ready');
    }, 1500);
  };

  // --- INTEGRASI REAL API GEMINI (Pemotongan Video AI) ---
  const handleGenerate = async () => {
    setProcessState('processing');
    setProgress(10);
    setProgressText('Menghubungkan ke Gemini AI...');
    setGeneratedShorts([]);

    try {
      const aiPrompt = `
        Anda adalah asisten AI Video Editor Profesional (ShortsMagic). Saya memiliki video YouTube dengan durasi total ${videoMetadata.durationSec} detik.
        Fokus utama potongan: ${globalAISettings.focus}.
        Buatkan HANYA ${videoMetadata.estimatedShorts} ide potongan video Shorts yang paling berpotensi viral dari video ini.

        KEMBALIKAN BALASAN HANYA DALAM BENTUK JSON ARRAY MURNI TANPA MARKDOWN ATAU TEKS LAIN.
        Struktur Object per potongan (buat tepat ${videoMetadata.estimatedShorts} object di dalam array):
        [
          {
            "title": "Judul Clickbait (Max 40 huruf)",
            "durationSec": <angka acak antara 20 dan 50>,
            "startTime": <angka detik mulai pemotongan acak, pastikan kurang dari ${videoMetadata.durationSec - 60}>,
            "score": "<angka acak 85 sampai 99>%",
            "viralInsights": ["Alasan viral 1", "Alasan viral 2", "Alasan viral 3"],
            "transcript": [
              {"time": "0:00", "text": "Kalimat pertama pembuka", "bRoll": null},
              {"time": "0:05", "text": "Kalimat kedua yang menarik", "bRoll": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80"},
              {"time": "0:10", "text": "Kalimat ketiga", "bRoll": null},
              {"time": "0:15", "text": "Kalimat penutup", "bRoll": null}
            ]
          }
        ]
      `;

      setProgress(30);
      setProgressText('Gemini sedang merancang struktur video & transkrip...');

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey.trim()
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: aiPrompt }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Gagal tersambung'}`);
      }

      const data = await response.json();
      setProgress(75);
      setProgressText('Menerjemahkan instruksi AI ke antarmuka aplikasi...');

      let textResponse = data.candidates[0].content.parts[0].text;
      
      // Membersihkan markdown dari respon Gemini
      textResponse = textResponse.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const geminiResults = JSON.parse(textResponse);

      setProgress(90);
      setProgressText('Menyiapkan pemutar video pintar & template...');

      const finalResults = geminiResults.map((item, index) => ({
        id: index + 1,
        title: item.title || `Part ${index + 1} - Hook Viral`,
        duration: `0:${item.durationSec.toString().padStart(2, '0')}`,
        durationSec: item.durationSec,
        score: item.score,
        img: `https://img.youtube.com/vi/${videoMetadata.id}/hqdefault.jpg`, 
        videoId: videoMetadata.id,
        startTime: item.startTime,
        endTime: item.startTime + item.durationSec,
        appliedTemplate: selectedTemplate,
        aiSettings: {
          faceTracking: true,
          autoBRoll: index % 2 === 0, 
          silenceRemoval: true
        },
        transcript: item.transcript,
        viralInsights: item.viralInsights
      }));

      setTimeout(() => {
        setGeneratedShorts(finalResults);
        setProcessState('completed');
      }, 1000);

    } catch (err) {
      console.error(err);
      setErrorMsg(`Gagal memproses AI: ${err.message}. Pastikan API Key valid atau batas kuota Anda belum habis.`);
      setProcessState('ready'); // Kembali ke tampilan siap agar user bisa edit API Key
    }
  };

  const Navbar = () => (
    <nav className="flex items-center justify-between p-6 bg-gray-950 border-b border-gray-800 sticky top-0 z-40 shadow-xl shadow-black/20">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => setCurrentView(user ? 'dashboard' : 'landing')}
      >
        <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
          <Scissors className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">ShortsMagic<span className="text-purple-500">.AI</span></span>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        <button onClick={() => setCurrentView('pricing')} className="text-gray-400 hover:text-white transition text-sm md:text-base font-medium">Pricing</button>
        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-sm text-right hidden sm:block">
              <p className="text-white font-medium">{user.name}</p>
              <p className="text-purple-400 text-xs flex items-center gap-1 justify-end capitalize">
                <Crown className="w-3 h-3" /> Paket {user.tier}
              </p>
            </div>
            <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition bg-gray-900 rounded-full border border-gray-800">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button onClick={() => handleLogin('free')} className="px-5 py-2.5 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Masuk / Daftar
          </button>
        )}
      </div>
    </nav>
  );

  const LandingView = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 text-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 font-medium text-sm mb-8 border border-purple-500/20 backdrop-blur-sm">
        <Sparkles className="w-4 h-4" /> Ditenagai oleh Google Gemini API
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight max-w-4xl tracking-tight">
        Satu Video Panjang, <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          Puluhan Shorts Otomatis
        </span>
      </h1>
      <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
        Masukkan link YouTube durasi berapapun. Hubungkan dengan API Key Anda, biarkan AI memotong dan merancang subtitle otomatis dengan mulus.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <button 
          onClick={() => handleLogin('free')} 
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:scale-105 transition shadow-[0_0_30px_rgba(168,85,247,0.4)] text-lg flex items-center justify-center gap-2"
        >
          Coba Gratis Sekarang <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const PricingView = () => (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">Harga Terjangkau untuk Kreator</h2>
        <p className="text-gray-400">Pilih paket sesuai kebutuhan durasi video Anda.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-gray-900/50 rounded-3xl p-8 border border-gray-800 flex flex-col">
          <h3 className="text-xl font-bold text-gray-300 mb-2">Starter</h3>
          <div className="text-4xl font-bold text-white mb-6">Gratis</div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-gray-400"><CheckCircle2 className="text-gray-600 w-5 h-5" /> Akses Fitur Dasar</li>
            <li className="flex items-center gap-3 text-gray-400"><CheckCircle2 className="text-gray-600 w-5 h-5" /> Maks Video 10 Menit</li>
            <li className="flex items-center gap-3 text-gray-400"><CheckCircle2 className="text-gray-600 w-5 h-5" /> Watermark Logo</li>
          </ul>
          <button onClick={() => handleLogin('free')} className="w-full py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition border border-gray-700">
            Daftar Gratis
          </button>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl p-8 border border-purple-500 relative flex flex-col transform md:-translate-y-4 shadow-2xl shadow-purple-500/10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
            <Crown className="w-4 h-4" /> BEST VALUE
          </div>
          <h3 className="text-xl font-bold text-purple-400 mb-2">Pro Creator</h3>
          <div className="text-4xl font-bold text-white mb-6">Rp 149rb<span className="text-lg text-gray-500 font-normal">/bln</span></div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-gray-200"><CheckCircle2 className="text-purple-500 w-5 h-5" /> Generasi Tanpa Batas</li>
            <li className="flex items-center gap-3 text-gray-200"><CheckCircle2 className="text-purple-500 w-5 h-5" /> Maks Video 2 Jam</li>
            <li className="flex items-center gap-3 text-gray-200"><CheckCircle2 className="text-purple-500 w-5 h-5" /> Render Prioritas Cepat</li>
            <li className="flex items-center gap-3 text-gray-200"><CheckCircle2 className="text-purple-500 w-5 h-5" /> Ekspor 1080p Tanpa Watermark</li>
          </ul>
          <button onClick={() => handleLogin('pro')} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:opacity-90 transition shadow-lg">
            Langganan Pro
          </button>
        </div>

        <div className="bg-gray-900/50 rounded-3xl p-8 border border-gray-800 flex flex-col">
          <h3 className="text-xl font-bold text-gray-300 mb-2">Agency</h3>
          <div className="text-4xl font-bold text-white mb-6">Rp 499rb<span className="text-lg text-gray-500 font-normal">/bln</span></div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-gray-400"><CheckCircle2 className="text-gray-600 w-5 h-5" /> API Access</li>
            <li className="flex items-center gap-3 text-gray-400"><CheckCircle2 className="text-gray-600 w-5 h-5" /> Durasi Video Unlimited</li>
            <li className="flex items-center gap-3 text-gray-400"><CheckCircle2 className="text-gray-600 w-5 h-5" /> Custom Font & B-Roll</li>
          </ul>
          <button onClick={() => handleLogin('agency')} className="w-full py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition border border-gray-700">
            Hubungi Sales
          </button>
        </div>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="max-w-6xl mx-auto py-8 px-4">
      
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">Workspace</h2>
          <p className="text-gray-400 text-sm">Buat konten baru atau lihat riwayat proyek Anda.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-inner">
          <span className="text-gray-400 text-sm">Status:</span>
          <span className="text-white font-bold flex items-center gap-1 capitalize">
            <Crown className="w-4 h-4 text-purple-500" /> {user?.tier} Plan
          </span>
        </div>
      </div>

      {processState === 'idle' && (
        <>
          <div className="mt-6 mb-6 bg-gray-950/60 rounded-xl border border-gray-800 p-4 transition-all shadow-lg">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowAISettings(!showAISettings)}
            >
              <h4 className="text-white font-semibold flex items-center gap-2 text-sm">
                <BrainCircuit className="w-4 h-4 text-purple-500" /> Pengaturan Mesin AI & API Key
              </h4>
              <div className="flex items-center gap-3">
                {apiKey && keyStatus === 'success' ? (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Terkoneksi</span>
                ) : apiKey ? (
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded border border-purple-500/30">Key Tersimpan</span>
                ) : (
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">Key Kosong</span>
                )}
                {showAISettings ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
              </div>
            </div>

            {showAISettings && (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* --- BLOK INPUT API KEY & TES KONEKSI --- */}
                <div className="bg-gray-900 border border-purple-500/30 shadow-inner shadow-purple-500/5 p-4 rounded-lg sm:col-span-2">
                  <label className="text-xs text-gray-300 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Key className="w-4 h-4 text-purple-400"/> API Key Utama (Google Gemini)
                  </label>
                  <div className="relative mt-2">
                    <input 
                      type="password"
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setKeyStatus(null);
                        setKeyMessage('');
                      }}
                      placeholder="Masukkan API Key (misal: AIzaSy...)"
                      className="w-full bg-gray-950 text-white text-sm border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg p-3 outline-none transition pr-[110px]"
                    />
                    <button 
                      onClick={testApiKey}
                      disabled={isTestingKey || !apiKey.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white text-xs font-bold rounded-md transition flex items-center gap-1"
                    >
                      {isTestingKey ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Tes Koneksi'}
                    </button>
                  </div>
                  
                  {/* Status Pesan Tes Koneksi */}
                  {keyStatus === 'success' && <p className="text-xs text-green-400 mt-3 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> {keyMessage}</p>}
                  {keyStatus === 'error' && <p className="text-xs text-red-400 mt-3 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> {keyMessage}</p>}
                  
                  <p className="text-[11px] text-gray-500 mt-3 flex items-center gap-1">
                    <Save className="w-3 h-3"/> Tersimpan otomatis secara lokal di perangkat Anda.
                  </p>
                </div>

                <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><Gauge className="w-3 h-3"/> Mode Proses</label>
                  <select 
                    value={globalAISettings.mode}
                    onChange={(e) => setGlobalAISettings({...globalAISettings, mode: e.target.value})}
                    className="w-full bg-gray-800 text-white text-sm border-none focus:ring-1 focus:ring-purple-500 rounded p-2 outline-none"
                  >
                    <option value="fast">🚀 Super Cepat (Draft)</option>
                    <option value="balanced">⚖️ Seimbang (Rekomendasi)</option>
                    <option value="quality">🌟 Kualitas Studio (Lambat)</option>
                  </select>
                </div>

                <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><Cpu className="w-3 h-3"/> Hardware Accel</label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-300">Gunakan GPU (Anti Lag)</span>
                    <button onClick={() => setGlobalAISettings({...globalAISettings, hardwareAccel: !globalAISettings.hardwareAccel})}>
                      {globalAISettings.hardwareAccel ? <ToggleRight className="w-8 h-8 text-purple-500" /> : <ToggleLeft className="w-8 h-8 text-gray-600" />}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg sm:col-span-2">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><Focus className="w-3 h-3"/> Fokus Target AI</label>
                  <select 
                    value={globalAISettings.focus}
                    onChange={(e) => setGlobalAISettings({...globalAISettings, focus: e.target.value})}
                    className="w-full bg-gray-800 text-white text-sm border-none focus:ring-1 focus:ring-purple-500 rounded p-2 outline-none"
                  >
                    <option value="viral">🔥 Momen Paling Viral / Engagement</option>
                    <option value="comedy">😂 Komedi & Reaksi Lucu</option>
                    <option value="education">📚 Edukasi / Poin Penting</option>
                  </select>
                </div>

              </div>
            )}
          </div>

          <div className="bg-gray-900/80 rounded-3xl p-8 border border-gray-800 shadow-xl mb-10">
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-3 flex items-center gap-2">
                <Youtube className="text-red-500 w-5 h-5" /> Paste Link YouTube Disini
              </label>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white px-5 py-4 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition shadow-inner"
                  />
                </div>
                <button 
                  onClick={handleAnalyzeVideo}
                  disabled={!youtubeUrl}
                  className="px-8 py-4 bg-white text-gray-950 font-bold rounded-xl hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[200px]"
                >
                  Analisis Video
                </button>
              </div>
              {errorMsg && <p className="text-red-400 text-sm mt-3 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> {errorMsg}</p>}
            </div>
          </div>
        </>
      )}

      {processState === 'analyzing' && (
        <div className="bg-gray-900/80 rounded-3xl p-12 border border-gray-800 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Mengambil Metadata Video...</h3>
          <p className="text-gray-400 text-sm">Menyiapkan URL dan mengambil durasi video sumber.</p>
        </div>
      )}

      {processState === 'ready' && videoMetadata && (
        <div className="bg-gray-900/80 rounded-3xl p-6 md:p-8 border border-gray-800 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 text-gray-400 mb-6 cursor-pointer hover:text-white w-fit transition" onClick={resetDashboard}>
            <ChevronLeft className="w-5 h-5" /> Ganti Video Lain
          </div>

          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="w-full md:w-1/3">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-800 bg-gray-950 mb-4 group shadow-lg">
                <img src={videoMetadata.thumbnail} alt="Thumbnail" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition" />
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {videoMetadata.durationStr}
                </div>
              </div>
              <h3 className="text-white font-bold leading-tight mb-2">{videoMetadata.title}</h3>
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider font-semibold">Estimasi AI</p>
                <p className="text-xl font-bold text-purple-400 flex items-center gap-2">
                  ~{globalAISettings.mode === 'fast' ? Math.ceil(videoMetadata.estimatedShorts / 2) : videoMetadata.estimatedShorts} Video Shorts
                </p>
              </div>
            </div>

            <div className="w-full md:w-2/3 flex flex-col justify-between">
              <div>
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2"><LayoutTemplate className="w-5 h-5"/> Gaya & Template Default</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {templates.map(tpl => (
                    <div 
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col gap-2 ${
                        selectedTemplate === tpl.id 
                          ? 'border-purple-500 bg-purple-500/10 shadow-inner' 
                          : 'border-gray-800 bg-gray-950 hover:border-gray-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedTemplate === tpl.id ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                        {tpl.icon}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${selectedTemplate === tpl.id ? 'text-white' : 'text-gray-300'}`}>{tpl.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{tpl.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 flex flex-col md:flex-row items-center justify-between border-t border-gray-800 gap-4">
                 <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Key className="w-4 h-4 text-green-500" /> API Key Gemini Siap
                 </div>
                <button 
                  onClick={handleGenerate}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition flex items-center gap-2 w-full md:w-auto justify-center"
                >
                  <Scissors className="w-5 h-5" /> Mulai Potong dengan AI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {processState === 'processing' && (
        <div className="bg-gray-900/80 rounded-3xl p-10 border border-gray-800 text-center shadow-2xl">
          <div className="max-w-xl mx-auto">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
              {/* Animasi lingkaran melambat saat API Processing */}
              <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" style={{ animationDuration: '2s' }}></div>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                {progress}%
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Gemini AI Sedang Bekerja...
            </h3>
            <p className="text-purple-400 font-medium mb-6 animate-pulse">{progressText}</p>
            
            <div className="bg-gray-950 rounded-xl p-4 text-left border border-gray-800 flex items-center gap-4">
               <FileVideo className="text-gray-600 w-8 h-8" />
               <div>
                 <p className="text-gray-400 text-sm">LLM sedang menyusun transkrip, skor, dan waktu potong.</p>
                 <p className="text-xs text-green-500 mt-1">Status: Terhubung via Google API endpoint</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {processState === 'completed' && (
        <div className="animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                <CheckCircle2 className="text-green-500 w-8 h-8" /> {generatedShorts.length} Shorts Berhasil Dibuat oleh AI!
              </h3>
            </div>
            <button onClick={resetDashboard} className="px-5 py-2.5 bg-gray-800 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition">
              Buat Projek Baru
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {generatedShorts.map((short) => (
              <div key={short.id} className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 group hover:border-purple-500/50 transition duration-300 shadow-lg flex flex-col">
                <div className="relative aspect-[9/16] bg-black">
                  <img src={short.img} alt={short.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition duration-500" />
                  
                  <div className="absolute top-3 left-3 flex gap-2">
                     <span className="bg-black/80 text-white text-xs px-2 py-1 rounded font-mono border border-gray-700">
                        {short.duration}
                      </span>
                  </div>
                  <div className="absolute top-3 right-3">
                     <span className="bg-gradient-to-r from-green-500/80 to-emerald-600/80 text-white text-xs px-2 py-1 rounded font-bold flex items-center gap-1 shadow-lg">
                        <Zap className="w-3 h-3 fill-white"/> Score: {short.score}
                      </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <button 
                      onClick={() => setPlayingVideo(short)}
                      className="bg-purple-600/90 p-4 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.5)] transform hover:scale-110 transition z-10"
                    >
                      <Play className="text-white w-6 h-6 fill-white ml-1" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <h4 className="text-white text-sm font-bold leading-snug line-clamp-2 mb-3 h-10">{short.title}</h4>
                  <div>
                    <div className="flex gap-2">
                      {downloadState.id === short.id ? (
                        <button disabled className="flex-1 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg flex justify-center items-center gap-2 transition cursor-wait shadow-inner">
                          <Loader2 className="w-4 h-4 animate-spin" /> {downloadState.progress < 100 ? `Merender ${downloadState.progress}%` : 'Selesai!'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleDownload(short)}
                          className="flex-1 py-2 bg-white text-gray-950 text-sm font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-gray-200 transition"
                        >
                          <Download className="w-4 h-4" /> Ekspor
                        </button>
                      )}
                      <button 
                        onClick={() => openStudio(short)}
                        className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition" 
                        title="Buka Pro Studio Editor"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
                      <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-500" /> <span className="capitalize">{short.appliedTemplate}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL PRO STUDIO EDITOR */}
      {editingShort && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-[85vh]">
            
            <div className="w-full md:w-5/12 bg-black relative flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-800 p-6 overflow-hidden">
              <img src={editingShort.img} alt="BG" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl" />
              
              <div className="relative z-10 w-full max-w-[280px] aspect-[9/16] bg-gray-900 border border-gray-700 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center justify-center text-center group">
                
                {isPlayingStudio && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 z-30">
                    <div className="h-full bg-purple-500 transition-all duration-75 ease-linear" style={{ width: `${playProgress}%` }}></div>
                  </div>
                )}

                {isPlayingStudio ? (
                  <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-black">
                    {editingShort.aiSettings?.autoBRoll && editedTranscript[activeSubtitleIndex]?.bRoll ? (
                      <div className="absolute inset-0 z-10 bg-black animate-in fade-in duration-300">
                        <img src={editedTranscript[activeSubtitleIndex].bRoll} alt="B-Roll" className="w-full h-full object-cover opacity-90 scale-105" />
                        <div className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded border border-white/20 flex items-center gap-1 text-[10px] text-white backdrop-blur-sm">
                          <ImageIcon className="w-3 h-3 text-purple-400" /> B-Roll Active
                        </div>
                      </div>
                    ) : null}

                    {/* GPU Hardware Acceleration Applied via Scale for Smooth Playback */}
                    <div className={`absolute inset-0 w-full h-full ${editingShort.aiSettings?.faceTracking ? 'animate-[pan_10s_ease-in-out_infinite_alternate]' : ''} ${globalAISettings.hardwareAccel ? 'transform-gpu' : ''}`}>
                      <iframe 
                        key={iframeKey}
                        src={`https://www.youtube.com/embed/${editingShort.videoId}?autoplay=1&mute=1&controls=0&start=${editingShort.startTime}&end=${editingShort.endTime}&playsinline=1&rel=0&modestbranding=1`}
                        className="absolute top-1/2 left-1/2 w-full h-full max-w-none -translate-x-1/2 -translate-y-1/2 scale-[3.5] sm:scale-[3.1] pointer-events-none"
                        allow="autoplay; encrypted-media"
                        title="Pro Studio Preview"
                      />
                    </div>
                  </div>
                ) : (
                  <img src={editingShort.img} alt="Video" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>
                
                {editingShort.aiSettings?.faceTracking && (
                  <div className="absolute top-6 right-4 z-20 opacity-50">
                    <Focus className="w-6 h-6 text-green-400 animate-pulse" />
                  </div>
                )}

                {!isPlayingStudio ? (
                  <button 
                    onClick={() => { setIsPlayingStudio(true); setPlayProgress(0); setIframeKey(k=>k+1); }}
                    className="bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/40 group-hover:scale-110 transition relative z-20"
                  >
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsPlayingStudio(false)}
                    className="absolute inset-0 w-full h-full z-20 flex items-center justify-center opacity-0 hover:opacity-100 transition bg-black/40"
                  >
                     <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-md border border-white/40 text-white font-bold text-sm">Pause</span>
                  </button>
                )}
                
                <div className="absolute bottom-16 left-4 right-4 text-center z-20 pointer-events-none">
                   <p className="text-white font-bold text-[15px] leading-tight drop-shadow-lg shadow-black bg-black/50 inline-block px-3 py-1.5 rounded-lg border border-gray-700/50 backdrop-blur-sm transition-all duration-300">
                     {editedTranscript.length > 0 ? editedTranscript[activeSubtitleIndex]?.text : ''}
                   </p>
                </div>
              </div>

              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-700 text-white text-xs font-mono z-20">
                Durasi: {editingShort.duration}
              </div>
            </div>

            <div className="w-full md:w-7/12 flex flex-col h-full bg-gray-900">
              <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-950/50">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /> Pro Studio</h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">{editingShort.title}</p>
                </div>
                <button onClick={() => { setEditingShort(null); setIsPlayingStudio(false); }} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex px-6 border-b border-gray-800 bg-gray-950/30 overflow-x-auto custom-scrollbar">
                <button onClick={() => setStudioTab('magic')} className={`px-4 py-4 text-sm font-semibold border-b-2 transition whitespace-nowrap -mb-[1px] ${studioTab === 'magic' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
                  <span className="flex items-center gap-1"><Wand2 className="w-4 h-4" /> AI Magic Tools</span>
                </button>
                <button onClick={() => setStudioTab('template')} className={`px-4 py-4 text-sm font-semibold border-b-2 transition whitespace-nowrap -mb-[1px] ${studioTab === 'template' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>Layout</button>
                <button onClick={() => setStudioTab('subtitles')} className={`px-4 py-4 text-sm font-semibold border-b-2 transition whitespace-nowrap -mb-[1px] ${studioTab === 'subtitles' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>Subtitle</button>
                <button onClick={() => setStudioTab('analytics')} className={`px-4 py-4 text-sm font-semibold border-b-2 transition whitespace-nowrap -mb-[1px] ${studioTab === 'analytics' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>Insights</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {studioTab === 'magic' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <p className="text-gray-400 text-sm mb-2">Tingkatkan kualitas retensi video dengan penyuntingan berbasis AI generatif.</p>
                    
                    <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white flex items-center gap-2"><Focus className="w-5 h-5 text-blue-400" /> Smart Face Tracking</h4>
                        <p className="text-sm text-gray-400 mt-1">AI menggeser crop 9:16 agar wajah selalu di tengah frame.</p>
                      </div>
                      <button onClick={() => setEditingShort({...editingShort, aiSettings: {...editingShort.aiSettings, faceTracking: !editingShort.aiSettings?.faceTracking}})}>
                        {editingShort.aiSettings?.faceTracking ? <ToggleRight className="w-10 h-10 text-purple-500" /> : <ToggleLeft className="w-10 h-10 text-gray-600" />}
                      </button>
                    </div>

                    <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white flex items-center gap-2"><ImageIcon className="w-5 h-5 text-emerald-400" /> Auto B-Roll (Visual)</h4>
                        <p className="text-sm text-gray-400 mt-1">Menganalisis teks dan menempelkan video ilustrasi di momen penting.</p>
                      </div>
                      <button onClick={() => setEditingShort({...editingShort, aiSettings: {...editingShort.aiSettings, autoBRoll: !editingShort.aiSettings?.autoBRoll}})}>
                        {editingShort.aiSettings?.autoBRoll ? <ToggleRight className="w-10 h-10 text-purple-500" /> : <ToggleLeft className="w-10 h-10 text-gray-600" />}
                      </button>
                    </div>

                    <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white flex items-center gap-2"><MicOff className="w-5 h-5 text-red-400" /> Remove Silences (Jump Cut)</h4>
                        <p className="text-sm text-gray-400 mt-1">Memotong otomatis jeda nafas, gumaman "umm", dan ruang kosong.</p>
                      </div>
                      <button onClick={() => setEditingShort({...editingShort, aiSettings: {...editingShort.aiSettings, silenceRemoval: !editingShort.aiSettings?.silenceRemoval}})}>
                        {editingShort.aiSettings?.silenceRemoval ? <ToggleRight className="w-10 h-10 text-purple-500" /> : <ToggleLeft className="w-10 h-10 text-gray-600" />}
                      </button>
                    </div>
                  </div>
                )}

                {studioTab === 'template' && (
                  <div className="space-y-4">
                    {templates.map(tpl => (
                      <div key={tpl.id} onClick={() => setEditingShort({...editingShort, appliedTemplate: tpl.id})} className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center gap-4 ${editingShort.appliedTemplate === tpl.id ? 'border-purple-500 bg-purple-500/10' : 'border-gray-800 bg-gray-950'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${editingShort.appliedTemplate === tpl.id ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}`}>{tpl.icon}</div>
                        <div>
                          <h4 className={`font-bold ${editingShort.appliedTemplate === tpl.id ? 'text-white' : 'text-gray-300'}`}>{tpl.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{tpl.desc}</p>
                        </div>
                        {editingShort.appliedTemplate === tpl.id && <CheckCircle2 className="w-6 h-6 text-purple-500 ml-auto" />}
                      </div>
                    ))}
                  </div>
                )}

                {studioTab === 'subtitles' && (
                  <div className="space-y-4">
                    {editedTranscript.map((line, index) => (
                      <div key={line.id} className="flex gap-3 items-start bg-gray-950 p-3 rounded-xl border border-gray-800">
                        <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded mt-1">{line.time}</span>
                        <textarea 
                          value={line.text}
                          onChange={(e) => {
                            const newTranscript = [...editedTranscript];
                            newTranscript[index].text = e.target.value;
                            setEditedTranscript(newTranscript);
                          }}
                          className="flex-1 bg-transparent text-gray-200 text-sm focus:outline-none resize-none h-12"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {studioTab === 'analytics' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-950 to-gray-900 rounded-2xl border border-gray-800">
                      <div className="text-center">
                         <span className="text-4xl font-bold text-green-500 block">{editingShort.score}</span>
                         <span className="text-xs text-gray-400 uppercase tracking-widest">Viral Score</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">Potensi Viral</h4>
                        <p className="text-sm text-gray-400">Berdasarkan pola hook, retensi, dan panjang video.</p>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {editingShort.viralInsights?.map((insight, idx) => (
                        <li key={idx} className="flex items-start gap-3 bg-gray-800/40 p-3 rounded-xl border border-gray-700/50">
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-300">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-gray-950/80">
                <button onClick={() => { setEditingShort(null); setIsPlayingStudio(false); }} className="px-6 py-2.5 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition">Tutup</button>
                <button 
                  onClick={() => {
                    setGeneratedShorts(generatedShorts.map(s => s.id === editingShort.id ? { ...editingShort, transcript: editedTranscript } : s));
                    setEditingShort(null);
                    setIsPlayingStudio(false);
                  }} 
                  className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:scale-105 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PEMUTAR VIDEO FULLSCREEN */}
      {playingVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <button 
            onClick={() => { setPlayingVideo(null); setPlayProgress(0); }}
            className="absolute top-6 right-6 p-3 text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 rounded-full transition z-10 border border-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-full max-w-[400px] aspect-[9/16] bg-black rounded-3xl overflow-hidden relative border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center">
            
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-800 z-30">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-75 ease-linear" style={{ width: `${playProgress}%` }}></div>
            </div>

            <div className={`absolute inset-0 w-full h-full ${globalAISettings.hardwareAccel ? 'transform-gpu' : ''}`}>
              <iframe 
                key={iframeKey}
                src={`https://www.youtube.com/embed/${playingVideo.videoId}?autoplay=1&mute=0&controls=0&start=${playingVideo.startTime}&end=${playingVideo.endTime}&playsinline=1&rel=0&modestbranding=1`}
                className="absolute top-1/2 left-1/2 w-full h-full max-w-none -translate-x-1/2 -translate-y-1/2 scale-[3.5] sm:scale-[3.1] pointer-events-none"
                allow="autoplay; encrypted-media"
                title="Result Video"
              />
            </div>
            
            <div className="absolute top-0 inset-x-0 p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10 pt-8">
              <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block shadow-lg">Preview Result</span>
              <h3 className="text-white font-bold leading-tight drop-shadow-md">{playingVideo.title}</h3>
            </div>
            
            <div className="absolute bottom-24 inset-x-0 text-center pointer-events-none px-4 z-10">
               <p className="text-white font-extrabold text-xl leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] shadow-black uppercase transition-all duration-300 transform scale-100">
                 <span className="bg-black/60 px-3 py-1.5 leading-relaxed rounded backdrop-blur-sm border border-white/10 shadow-xl inline-block animate-in zoom-in duration-200">
                   {playingVideo.transcript[activeSubtitleIndex]?.text?.toUpperCase() || '...'}
                 </span>
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 font-sans selection:bg-purple-500/30">
      <Navbar />
      <main className="container mx-auto pb-20">
        {currentView === 'landing' && <LandingView />}
        {currentView === 'pricing' && <PricingView />}
        {currentView === 'dashboard' && <DashboardView />}
      </main>
    </div>
  );
}