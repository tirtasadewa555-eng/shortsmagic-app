import React, { useState, useEffect, useRef } from 'react';
import { 
  Scissors, Youtube, LayoutTemplate, Download, 
  Zap, Crown, Play, CheckCircle2, ChevronRight, 
  LogOut, User, Video, Loader2, Sparkles, AlertCircle,
  Clock, FileVideo, ChevronLeft, X,
  Type, BarChart2, Settings, MessageSquare, Save
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null); 
  const [currentView, setCurrentView] = useState('landing'); 
  
  // State Dashboard (Siap Produksi)
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('podcast');
  
  // State Proses
  const [processState, setProcessState] = useState('idle'); // idle, analyzing, ready, processing, completed
  const [videoMetadata, setVideoMetadata] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [generatedShorts, setGeneratedShorts] = useState([]);
  
  // State Fitur Baru: Edit Template Per Video & Pro Studio
  const [editingShort, setEditingShort] = useState(null);
  const [studioTab, setStudioTab] = useState('template'); // 'template', 'subtitles', 'analytics'
  const [editedTranscript, setEditedTranscript] = useState([]);
  
  // State Fitur Pemutar Video Mockup
  const [playingVideo, setPlayingVideo] = useState(null);
  const [isPlayingStudio, setIsPlayingStudio] = useState(false);
  
  // STATE BARU: Untuk animasi subtitle berjalan
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);

  // EFFECT BARU: Mengganti teks subtitle setiap 2.5 detik saat video diputar
  useEffect(() => {
    let interval;
    if (playingVideo || isPlayingStudio) {
      interval = setInterval(() => {
        setActiveSubtitleIndex((prev) => {
          const currentTranscript = playingVideo ? playingVideo.transcript : editedTranscript;
          if (!currentTranscript || currentTranscript.length === 0) return 0;
          return (prev + 1) % currentTranscript.length;
        });
      }, 2500); // Ganti teks setiap 2.5 detik
    } else {
      setActiveSubtitleIndex(0);
    }
    return () => clearInterval(interval);
  }, [playingVideo, isPlayingStudio, editedTranscript]);

  // Handler saat membuka editor Pro Studio
  const openStudio = (short) => {
    setEditingShort(short);
    setStudioTab('template');
    setEditedTranscript(short.transcript || []);
    setActiveSubtitleIndex(0);
  };

  const templates = [
    { id: 'podcast', name: 'Podcast Style', desc: 'Teks di tengah, fokus wajah', icon: <User className="w-6 h-6" /> },
    { id: 'gaming', name: 'Gaming Split', desc: 'Facecam di atas, game di bawah', icon: <Video className="w-6 h-6" /> },
    { id: 'motivation', name: 'Motivasi Viral', desc: 'Teks tebal, efek zoom dramatis', icon: <Sparkles className="w-6 h-6" /> },
  ];

  // Fungsi utilitas untuk ekstrak ID YouTube
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

  // 1. FASE ANALISIS: Mengambil data video asli (Mockup API Call)
  const handleAnalyzeVideo = async () => {
    const videoId = extractYouTubeID(youtubeUrl);
    if (!videoId) {
      setErrorMsg('Masukkan link YouTube yang valid! (contoh: https://youtube.com/watch?v=...)');
      return;
    }
    setErrorMsg('');
    setProcessState('analyzing');

    // MOCKUP API CALL: Di produksi, ganti dengan fetch('/api/get-youtube-metadata')
    setTimeout(() => {
      // Membuat durasi acak antara 5 hingga 60 menit untuk simulasi
      const mockDurationSec = Math.floor(Math.random() * (3600 - 300 + 1) + 300);
      const minutes = Math.floor(mockDurationSec / 60);
      const seconds = mockDurationSec % 60;
      
      // Kalkulasi estimasi shorts (1 short untuk setiap ~3 menit video)
      const estimatedShortsCount = Math.max(2, Math.ceil(mockDurationSec / 180));

      setVideoMetadata({
        id: videoId,
        title: `Video YouTube Original - ${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        durationSec: mockDurationSec,
        durationStr: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        estimatedShorts: estimatedShortsCount
      });
      setProcessState('ready');
    }, 2000);
  };

  // 2. FASE GENERATE: Proses AI membuat video (Mockup API Call)
  const handleGenerate = async () => {
    setProcessState('processing');
    setProgress(0);
    setGeneratedShorts([]);

    const steps = [
      'Mengunduh video utama (1080p)...',
      'Whisper AI sedang men-transkrip audio...',
      'Mendeteksi momen dengan engagement tinggi...',
      'Memotong video menjadi frame vertikal...',
      'Menerapkan template & merender subtitle dinamis...',
      'Menyelesaikan ekspor video...'
    ];

    let currentStep = 0;
    
    // MOCKUP PROSES WEBSOCKET/POLLING
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Kecepatan progress disimulasikan berdasarkan durasi video (video panjang = proses lama)
        const increment = videoMetadata.durationSec > 1800 ? 2 : 5; 
        const next = prev + increment;
        
        if (next >= (currentStep + 1) * (100 / steps.length) && currentStep < steps.length - 1) {
          currentStep++;
        }
        setProgressText(steps[currentStep]);

        if (next >= 100) {
          clearInterval(interval);
          
          // Generate array hasil sesuai estimasi
          const results = Array.from({ length: videoMetadata.estimatedShorts }).map((_, i) => {
            // Tentukan titik mulai pemotongan acak di video asli
            const randomStart = Math.floor(Math.random() * (videoMetadata.durationSec > 60 ? videoMetadata.durationSec - 60 : 0));
            
            return {
              id: i + 1,
              title: `Part ${i + 1} - Momen Menarik dari Video Utama`,
              duration: `0:${Math.floor(Math.random() * (60 - 30 + 1) + 30)}`, 
              score: `${Math.floor(Math.random() * (99 - 80 + 1) + 80)}%`,
              // Menggunakan Thumbnail asli dari video YouTube yang diinput
              img: `https://img.youtube.com/vi/${videoMetadata.id}/hqdefault.jpg`, 
              videoId: videoMetadata.id,
              startTime: randomStart, // Titik mulai (detik)
              appliedTemplate: selectedTemplate, // Template bawaan dari pilihan awal
              transcript: [
                { id: 1, time: '0:00 - 0:05', text: 'Pernahkah kalian menyadari rahasia besar ini?' },
                { id: 2, time: '0:05 - 0:12', text: 'Banyak orang yang melewatkan detail penting yang ada di depan mata.' },
                { id: 3, time: '0:12 - 0:20', text: 'Tonton sampai habis untuk melihat penjelasan lengkapnya!' }
              ],
              viralInsights: [
                'Hook awal sangat kuat memancing rasa penasaran.',
                'Terdapat transisi visual dinamis di detik ke-5.',
                'Teks besar & tebal membantu retensi penonton (auto-caption).'
              ]
            };
          });

          setGeneratedShorts(results);
          setProcessState('completed');
        }
        return next > 100 ? 100 : next;
      });
    }, 400); // Kecepatan interval
  };

  // --- KOMPONEN NAVIGASI ---
  const Navbar = () => (
    <nav className="flex items-center justify-between p-6 bg-gray-950 border-b border-gray-800 sticky top-0 z-50">
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

  // --- KOMPONEN LANDING PAGE ---
  const LandingView = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 text-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 font-medium text-sm mb-8 border border-purple-500/20 backdrop-blur-sm">
        <Sparkles className="w-4 h-4" /> Engine V2.0 - Analisis Durasi Dinamis
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight max-w-4xl tracking-tight">
        Satu Video Panjang, <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          Puluhan Shorts Otomatis
        </span>
      </h1>
      <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
        Masukkan link YouTube durasi berapapun. AI kami mendeteksi durasi, menemukan momen terbaik, dan membuatkan puluhan video vertikal siap upload ke TikTok, IG Reels, & Shorts.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <button 
          onClick={() => handleLogin('free')} 
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:scale-105 transition shadow-[0_0_30px_rgba(168,85,247,0.4)] text-lg flex items-center justify-center gap-2"
        >
          Mulai Gratis <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // --- KOMPONEN PRICING ---
  const PricingView = () => (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">Harga Terjangkau untuk Kreator</h2>
        <p className="text-gray-400">Pilih paket sesuai kebutuhan durasi video Anda.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Tier Free */}
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

        {/* Tier Pro */}
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

        {/* Tier Agency */}
        <div className="bg-gray-900/50 rounded-3xl p-8 border border-gray-800 flex flex-col">
          <h3 className="text-xl font-bold text-gray-300 mb-2">Agency</h3>
          <div className="text-4xl font-bold text-white mb-6">Rp 499rb<span className="text-lg text-gray-500 font-normal">/bln</span></div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-gray-400"><CheckCircle2 className="text-gray-600 w-5 h-5" /> Generasi Skala Besar</li>
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

  // --- KOMPONEN DASHBOARD (WORKSPACE) ---
  const DashboardView = () => (
    <div className="max-w-6xl mx-auto py-8 px-4">
      
      {/* Area Navigasi Dashboard */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Workspace
          </h2>
          <p className="text-gray-400 text-sm">Buat konten baru atau lihat riwayat proyek Anda.</p>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-inner">
          <span className="text-gray-400 text-sm">Status:</span>
          <span className="text-white font-bold flex items-center gap-1 capitalize">
            <Crown className="w-4 h-4 text-purple-500" /> {user?.tier} Plan
          </span>
        </div>
      </div>

      {/* Tampilan IDLE (Input URL) */}
      {processState === 'idle' && (
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
                  className="w-full bg-gray-950 border border-gray-800 text-white px-5 py-4 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
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
      )}

      {/* Tampilan ANALYZING */}
      {processState === 'analyzing' && (
        <div className="bg-gray-900/80 rounded-3xl p-12 border border-gray-800 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Mengambil Metadata Video...</h3>
          <p className="text-gray-400 text-sm">Sistem sedang membaca durasi dan kualitas video sumber.</p>
        </div>
      )}

      {/* Tampilan READY (Konfirmasi & Pilih Template) */}
      {processState === 'ready' && videoMetadata && (
        <div className="bg-gray-900/80 rounded-3xl p-6 md:p-8 border border-gray-800 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 text-gray-400 mb-6 cursor-pointer hover:text-white w-fit transition" onClick={resetDashboard}>
            <ChevronLeft className="w-5 h-5" /> Ganti Video Lain
          </div>

          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Info Video Kiri */}
            <div className="w-full md:w-1/3">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-800 bg-gray-950 mb-4 group">
                <img src={videoMetadata.thumbnail} alt="Thumbnail" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition" />
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {videoMetadata.durationStr}
                </div>
              </div>
              <h3 className="text-white font-bold leading-tight mb-2">{videoMetadata.title}</h3>
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider font-semibold">Estimasi AI</p>
                <p className="text-xl font-bold text-purple-400 flex items-center gap-2">
                  ~{videoMetadata.estimatedShorts} Video Shorts
                </p>
                <p className="text-gray-500 text-xs mt-1">Berdasarkan durasi asli {videoMetadata.durationStr}</p>
              </div>
            </div>

            {/* Pengaturan Kanan */}
            <div className="w-full md:w-2/3 flex flex-col justify-between">
              <div>
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2"><LayoutTemplate className="w-5 h-5"/> Gaya & Template</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {templates.map(tpl => (
                    <div 
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col gap-2 ${
                        selectedTemplate === tpl.id 
                          ? 'border-purple-500 bg-purple-500/10' 
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

              <div className="mt-8 pt-4 flex items-center justify-end">
                <button 
                  onClick={handleGenerate}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition flex items-center gap-2 w-full md:w-auto justify-center"
                >
                  <Scissors className="w-5 h-5" /> Mulai Potong Video
                </button>
              </div>
              {errorMsg && <p className="text-red-400 text-sm mt-2 text-right">{errorMsg}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Tampilan PROCESSING */}
      {processState === 'processing' && (
        <div className="bg-gray-900/80 rounded-3xl p-10 border border-gray-800 text-center shadow-2xl">
          <div className="max-w-xl mx-auto">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                {progress}%
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">AI Sedang Merender Video...</h3>
            <p className="text-purple-400 font-medium mb-6 animate-pulse">{progressText}</p>
            
            <div className="bg-gray-950 rounded-xl p-4 text-left border border-gray-800 flex items-center gap-4">
               <FileVideo className="text-gray-600 w-8 h-8" />
               <div>
                 <p className="text-gray-400 text-sm">Menyiapkan <strong className="text-white">{videoMetadata.estimatedShorts}</strong> potongan video vertikal.</p>
                 <p className="text-gray-500 text-xs mt-1">Proses ini memakan waktu tergantung durasi video asli.</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Tampilan COMPLETED (Galeri Hasil) */}
      {processState === 'completed' && (
        <div className="animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                <CheckCircle2 className="text-green-500 w-8 h-8" /> Selesai! {generatedShorts.length} Shorts Berhasil Dibuat
              </h3>
              <p className="text-gray-400 mt-2">Semua klip telah dipotong dengan aspek rasio 9:16 dan subtitle terpasang.</p>
            </div>
            <button onClick={resetDashboard} className="px-5 py-2.5 bg-gray-800 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition">
              Buat Projek Baru
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {generatedShorts.map((short, index) => (
              <div key={short.id} className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 group hover:border-purple-500/50 transition duration-300 shadow-lg">
                <div className="relative aspect-[9/16] bg-black">
                  <img src={short.img} alt={short.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition duration-500" />
                  
                  {/* Overlay Meta */}
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

                  {/* Play Overlay - SEKARANG BISA DIKLIK */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <button 
                      onClick={() => setPlayingVideo(short)}
                      className="bg-purple-600/90 p-4 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.5)] transform hover:scale-110 transition z-10"
                    >
                      <Play className="text-white w-6 h-6 fill-white ml-1" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="text-white text-sm font-bold leading-snug line-clamp-2 mb-3 h-10" title={short.title}>{short.title}</h4>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-white text-gray-950 text-sm font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-gray-200 transition">
                      <Download className="w-4 h-4" /> Ekspor
                    </button>
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
                    <span className="text-gray-400 font-semibold bg-gray-800 px-2 py-0.5 rounded">Pro Studio</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Editor "Pro Studio" untuk Video Spesifik */}
      {editingShort && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-[85vh]">
            
            {/* Kiri: Preview Video */}
            <div className="w-full md:w-5/12 bg-black relative flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-800 p-6 overflow-hidden">
              <img src={editingShort.img} alt="Preview Background" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl" />
              
              {/* Simulasi Tampilan Video di Workspace */}
              <div className="relative z-10 w-full max-w-[280px] aspect-[9/16] bg-gray-900 border border-gray-700 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center justify-center text-center group">
                
                {isPlayingStudio ? (
                  <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-black">
                    {/* Trik CSS merubah video YouTube 16:9 menjadi cover 9:16 */}
                    <iframe 
                      src={`https://www.youtube.com/embed/${editingShort.videoId}?autoplay=1&mute=1&controls=0&start=${editingShort.startTime}&loop=1&playlist=${editingShort.videoId}&modestbranding=1`}
                      className="absolute top-1/2 left-1/2 w-[350%] h-[100%] max-w-none -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      allow="autoplay; encrypted-media"
                      title="Pro Studio Preview"
                    />
                  </div>
                ) : (
                  <img src={editingShort.img} alt="Video" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>
                
                {!isPlayingStudio ? (
                  <button 
                    onClick={() => setIsPlayingStudio(true)}
                    className="bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/40 group-hover:scale-110 transition relative z-10"
                  >
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsPlayingStudio(false)}
                    className="absolute inset-0 w-full h-full z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition bg-black/40"
                  >
                     <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-md border border-white/40 text-white font-bold text-sm">
                       Pause
                     </span>
                  </button>
                )}
                
                {/* Simulasi Subtitle Muncul di Preview (Sekarang Berjalan Dinamis) */}
                <div className="absolute bottom-16 left-4 right-4 text-center z-20 pointer-events-none">
                   <p className="text-white font-bold text-[15px] leading-tight drop-shadow-lg shadow-black bg-black/50 inline-block px-3 py-1.5 rounded-lg border border-gray-700/50 backdrop-blur-sm transition-all duration-300">
                     {editedTranscript.length > 0 ? editedTranscript[activeSubtitleIndex]?.text : 'Subtitle AI disini'}
                   </p>
                </div>
              </div>

              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-700 text-white text-xs font-mono z-20">
                Durasi: {editingShort.duration}
              </div>
            </div>

            {/* Kanan: Pro Studio Tools */}
            <div className="w-full md:w-7/12 flex flex-col h-full bg-gray-900">
              {/* Header Studio */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-950/50">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" /> Pro Studio Editor
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">Klip: {editingShort.title}</p>
                </div>
                <button onClick={() => setEditingShort(null)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigasi Tab */}
              <div className="flex px-6 border-b border-gray-800 bg-gray-950/30 overflow-x-auto custom-scrollbar">
                <button 
                  onClick={() => setStudioTab('template')}
                  className={`px-4 py-4 text-sm font-semibold border-b-2 transition whitespace-nowrap -mb-[1px] ${studioTab === 'template' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                  <div className="flex items-center gap-2"><LayoutTemplate className="w-4 h-4"/> Layout & Gaya</div>
                </button>
                <button 
                  onClick={() => setStudioTab('subtitles')}
                  className={`px-4 py-4 text-sm font-semibold border-b-2 transition whitespace-nowrap -mb-[1px] ${studioTab === 'subtitles' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                  <div className="flex items-center gap-2"><Type className="w-4 h-4"/> Edit Subtitle</div>
                </button>
                <button 
                  onClick={() => setStudioTab('analytics')}
                  className={`px-4 py-4 text-sm font-semibold border-b-2 transition whitespace-nowrap -mb-[1px] ${studioTab === 'analytics' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                  <div className="flex items-center gap-2"><BarChart2 className="w-4 h-4"/> Viral Insights</div>
                </button>
              </div>

              {/* Area Konten Dinamis */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                
                {/* TAB 1: TEMPLATE */}
                {studioTab === 'template' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <p className="text-gray-400 text-sm mb-4">Pilih gaya visual framing, posisi facecam, dan animasi teks.</p>
                    {templates.map(tpl => (
                      <div 
                        key={tpl.id}
                        onClick={() => setEditingShort({...editingShort, appliedTemplate: tpl.id})}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center gap-4 ${
                          editingShort.appliedTemplate === tpl.id 
                            ? 'border-purple-500 bg-purple-500/10' 
                            : 'border-gray-800 bg-gray-950 hover:border-gray-600'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner ${editingShort.appliedTemplate === tpl.id ? 'bg-purple-500 text-white shadow-purple-500/50' : 'bg-gray-800 text-gray-400'}`}>
                          {tpl.icon}
                        </div>
                        <div>
                          <h4 className={`font-bold ${editingShort.appliedTemplate === tpl.id ? 'text-white' : 'text-gray-300'}`}>{tpl.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{tpl.desc}</p>
                        </div>
                        {editingShort.appliedTemplate === tpl.id && (
                          <CheckCircle2 className="w-6 h-6 text-purple-500 ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 2: SUBTITLE */}
                {studioTab === 'subtitles' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-gray-400 text-sm">Koreksi kata dari transkrip AI agar 100% akurat.</p>
                      <button className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1 border border-gray-700">
                        <MessageSquare className="w-3 h-3" /> Auto-Translate
                      </button>
                    </div>
                    {editedTranscript.map((line, index) => (
                      <div key={line.id} className="flex gap-3 items-start bg-gray-950 p-3 rounded-xl border border-gray-800 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition shadow-sm">
                        <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded mt-1 border border-purple-500/20">{line.time}</span>
                        <textarea 
                          value={line.text}
                          onChange={(e) => {
                            const newTranscript = [...editedTranscript];
                            newTranscript[index].text = e.target.value;
                            setEditedTranscript(newTranscript);
                          }}
                          className="flex-1 bg-transparent text-gray-200 text-sm focus:outline-none resize-none h-16 leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 3: ANALYTICS */}
                {studioTab === 'analytics' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-r from-gray-950 to-gray-900 rounded-2xl border border-gray-800 shadow-inner">
                      <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          <path className="text-green-500" strokeDasharray={`${editingShort.score.replace('%','')} 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-3xl font-bold text-white leading-none">{editingShort.score}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Score</span>
                        </div>
                      </div>
                      <div className="text-center sm:text-left">
                        <h4 className="text-lg font-bold text-white mb-1">Skor Potensi Viral</h4>
                        <p className="text-sm text-gray-400">AI menganalisis seberapa besar kemungkinan video ini menahan audiens (retention rate) berdasarkan pola video populer.</p>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-white mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500"/> Mengapa AI memilih momen ini?</h5>
                      <ul className="space-y-3">
                        {editingShort.viralInsights?.map((insight, idx) => (
                          <li key={idx} className="flex items-start gap-3 bg-gray-800/40 p-3.5 rounded-xl border border-gray-700/50 hover:border-gray-600 transition">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300 leading-relaxed">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Modal / Aksi */}
              <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-gray-950/80 backdrop-blur-sm">
                <button 
                  onClick={() => {
                    setEditingShort(null);
                    setIsPlayingStudio(false);
                  }} 
                  className="px-6 py-2.5 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition"
                >
                  Tutup
                </button>
                <button 
                  onClick={() => {
                    // Simpan semua perubahan (Template + Teks Subtitle) ke state utama
                    setGeneratedShorts(generatedShorts.map(s => 
                      s.id === editingShort.id ? { ...editingShort, transcript: editedTranscript } : s
                    ));
                    setEditingShort(null);
                    setIsPlayingStudio(false);
                  }} 
                  className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:scale-105 transition shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Terapkan & Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PEMUTAR VIDEO (Galeri Hasil) */}
      {playingVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <button 
            onClick={() => setPlayingVideo(null)}
            className="absolute top-6 right-6 p-3 text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 rounded-full transition z-10 border border-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-full max-w-[400px] aspect-[9/16] bg-black rounded-3xl overflow-hidden relative border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center">
            
            {/* Trik YouTube iFrame diubah jadi format Shorts */}
            <iframe 
              src={`https://www.youtube.com/embed/${playingVideo.videoId}?autoplay=1&mute=0&controls=0&start=${playingVideo.startTime}&loop=1&playlist=${playingVideo.videoId}&rel=0&modestbranding=1`}
              className="absolute top-1/2 left-1/2 w-[350%] h-[100%] max-w-none -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              allow="autoplay; encrypted-media"
              title="Result Video"
            />
            
            {/* Overlay Header Video */}
            <div className="absolute top-0 inset-x-0 p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10">
              <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block shadow-lg">
                Preview Result
              </span>
              <h3 className="text-white font-bold leading-tight drop-shadow-md">{playingVideo.title}</h3>
            </div>
            
            {/* Overlay Subtitle Buatan AI (Sekarang Berjalan Dinamis) */}
            <div className="absolute bottom-24 inset-x-0 text-center pointer-events-none px-4 z-10">
               <p className="text-white font-extrabold text-xl leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] shadow-black uppercase transition-all duration-300 transform scale-100">
                 <span className="bg-black/60 px-3 py-1.5 leading-relaxed rounded backdrop-blur-sm border border-white/10 shadow-xl inline-block animate-in zoom-in duration-200">
                   {playingVideo.transcript[activeSubtitleIndex]?.text.toUpperCase() || '...'}
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