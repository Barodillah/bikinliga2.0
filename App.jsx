import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Menu, Zap, PlayCircle, Users, BarChart2, Calendar, 
  Share2, Swords, ShieldCheck, Check, ChevronDown, 
  Instagram, Twitter, Facebook, PlusSquare, Copy, X
} from 'lucide-react';

// --- Custom Hooks ---

// Hook untuk animasi counting
const useCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTime = null;
          
          const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            // Ease out quart function for smooth slowing down
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            
            setCount(Math.floor(easeProgress * end));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) observer.unobserve(elementRef.current);
    };
  }, [end, duration]);

  return [count, elementRef];
};

// Hook untuk scroll reveal animation
const useReveal = () => {
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return ref;
};

// --- Sub-Components ---

const StatItem = ({ end, label, colorClass, suffix = "+" }) => {
  const [count, ref] = useCounter(end);
  const revealRef = useReveal();

  return (
    <div ref={revealRef} className="reveal text-center">
      <div ref={ref} className={`text-3xl md:text-4xl font-display font-bold ${colorClass}`}>
        {count}{suffix}
      </div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color, delay }) => {
  const revealRef = useReveal();
  const colorClasses = {
    green: {
      bg: 'bg-[#02FE02]/10',
      text: 'text-[#02FE02]',
      hoverBg: 'group-hover:bg-[#02FE02]',
      hoverBorder: 'hover:border-[#02FE02]/50',
    },
    pink: {
      bg: 'bg-[#FE00C9]/10',
      text: 'text-[#FE00C9]',
      hoverBg: 'group-hover:bg-[#FE00C9]',
      hoverBorder: 'hover:border-[#FE00C9]/50',
    }
  };

  const c = colorClasses[color];

  return (
    <div 
      ref={revealRef} 
      className={`glass-panel p-8 rounded-2xl ${c.hoverBorder} transition-all duration-300 group reveal`}
      style={{ transitionDelay: delay }}
    >
      <div className={`w-14 h-14 rounded-full ${c.bg} flex items-center justify-center mb-6 ${c.hoverBg} group-hover:text-black transition-colors ${c.text}`}>
        <div className="relative">
          <Icon className="w-7 h-7 relative z-10" />
          <div className="absolute inset-0 bg-current rounded-full opacity-0 group-hover:animate-ping-slow"></div>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3 font-display">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
};

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button 
        className={`w-full text-left px-6 py-4 bg-[#1a1a1a] hover:bg-[#222] flex justify-between items-center transition-colors focus:outline-none ${isOpen ? 'text-[#02FE02]' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold">{question}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>
      <div className={`${isOpen ? 'block' : 'hidden'} px-6 py-4 bg-[#121212] text-gray-400 text-sm border-t border-white/5`}>
        {answer}
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [progressHeight, setProgressHeight] = useState('0%');

  // Navbar Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Slider Logic for "How It Works"
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Update progress bar when activeStep changes
  useEffect(() => {
    if (activeStep === 1) setProgressHeight('0%');
    if (activeStep === 2) setProgressHeight('50%');
    if (activeStep === 3) setProgressHeight('100%');
  }, [activeStep]);

  const handleStepClick = (step) => {
    setActiveStep(step);
  };

  const navLinks = [
    { name: 'Fitur', href: '#fitur' },
    { name: 'Cara Kerja', href: '#cara-kerja' },
    { name: 'Harga', href: '#harga' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <div className="font-sans bg-[#050505] text-white overflow-x-hidden selection:bg-[#FE00C9] selection:text-white">
      {/* --- Styles for Custom Animations & Fonts (Simulating global CSS) --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Space+Grotesk:wght@500;700&display=swap');
        
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        
        .glass-panel {
          background: rgba(18, 18, 18, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .gradient-text {
          background: linear-gradient(90deg, #02FE02, #FE00C9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .btn-primary {
          background: linear-gradient(45deg, #02FE02, #00c400);
          color: #000;
          font-weight: 700;
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(2, 254, 2, 0.6);
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid #FE00C9;
          color: #FE00C9;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .btn-secondary:hover {
          background: #FE00C9;
          color: #fff;
          box-shadow: 0 0 20px rgba(254, 0, 201, 0.6);
        }

        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease-out;
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }

        /* Animations */
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-pulse-glow { animation: pulse-glow 3s infinite; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        @keyframes ping-slow {
           0% { transform: scale(1); opacity: 0; }
           50% { opacity: 0.3; }
           100% { transform: scale(1.5); opacity: 0; }
        }
        .group-hover\\:animate-ping-slow:hover { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }

        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .group-hover\\:animate-wiggle:hover { animation: wiggle 1s ease-in-out infinite; }

        @keyframes grow-bar {
          0% { transform: scaleY(0.7); }
          100% { transform: scaleY(1); }
        }
        .group-hover\\:animate-grow-bar:hover { animation: grow-bar 2s ease-in-out infinite alternate; }

        @keyframes clash {
           0%, 100% { transform: rotate(0deg) scale(1); }
           50% { transform: rotate(15deg) scale(1.1); }
        }
        .group-hover\\:animate-clash:hover { animation: clash 2s ease-in-out infinite; }

        .dashboard-item {
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.6s ease-out;
        }
        .reveal.active .dashboard-item {
            opacity: 1;
            transform: translateX(0);
        }

        /* Ambient Glow */
        .ambient-glow {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          filter: blur(100px);
          z-index: -1;
          opacity: 0.2;
        }

        /* Step Visuals */
        .step-visual {
          position: absolute;
          inset: 0;
          opacity: 0;
          transform: scale(0.9) translateY(10px);
          transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          width: 100%;
          height: 100%;
        }
        .step-visual.active {
          opacity: 1;
          transform: scale(1) translateY(0);
          pointer-events: auto;
          z-index: 10;
        }

        .step-trigger {
          transition: all 0.3s ease;
          cursor: pointer;
          background: rgba(18, 18, 18, 0.4);
          backdrop-filter: blur(4px);
        }
        .step-trigger:hover { background: rgba(255, 255, 255, 0.05); }
        .step-trigger.active {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(2, 254, 2, 0.2);
        }
      `}</style>

      {/* Decorative Backgrounds */}
      <div className="ambient-glow bg-[#02FE02] top-0 left-0"></div>
      <div className="ambient-glow bg-[#FE00C9] bottom-0 right-0"></div>

      {/* Navbar */}
      <nav className={`fixed w-full z-50 glass-panel border-b border-white/10 transition-all duration-300 ${isScrolled ? 'bg-black/80 shadow-lg' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <Trophy className="w-8 h-8 text-[#02FE02]" />
              <span className="font-display font-bold text-2xl tracking-tight">Bikin<span className="text-[#FE00C9]">Liga</span></span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navLinks.map(link => (
                  <a key={link.name} href={link.href} className="hover:text-[#02FE02] transition-colors px-3 py-2 rounded-md text-sm font-medium">
                    {link.name}
                  </a>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <a href="#" className="btn-primary px-6 py-2 rounded-full text-sm">Masuk / Daftar</a>
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map(link => (
                <a key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-[#02FE02] block px-3 py-2 rounded-md text-base font-medium">
                  {link.name}
                </a>
              ))}
              <a href="#" className="mt-4 block w-full text-center btn-primary px-6 py-3 rounded-md text-base">Masuk / Daftar</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#02FE02]/30 bg-[#02FE02]/10 text-[#02FE02] text-sm font-semibold mb-6 animate-pulse-glow">
              <span className="w-2 h-2 rounded-full bg-[#02FE02]"></span>
              Platform #1 untuk Komunitas eFootball
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 leading-tight">
              Kelola Turnamen <br />
              <span className="gradient-text">Semudah Kick-Off</span>
            </h1>
            
            <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              BikinLiga adalah web apps pengelolaan kompetisi football game. Buat bracket, atur jadwal, dan pantau klasemen eFootball secara otomatis dan real-time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="#" className="btn-primary w-full sm:w-auto px-8 py-4 rounded-full text-lg flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Buat Liga Sekarang
              </a>
              <a href="#demo" className="btn-secondary w-full sm:w-auto px-8 py-4 rounded-full text-lg flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Lihat Demo
              </a>
            </div>
          </div>

          {/* Hero Visual / Dashboard Preview */}
          <div className="mt-16 relative mx-auto max-w-5xl reveal" ref={useReveal()}>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#02FE02] to-[#FE00C9] rounded-2xl blur opacity-30"></div>
            <div className="relative rounded-2xl bg-[#121212] border border-white/10 overflow-hidden shadow-2xl">
              <div className="h-8 bg-[#1a1a1a] border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="ml-4 h-4 w-64 bg-white/10 rounded-full text-[10px] flex items-center px-2 text-gray-500 font-mono">
                  BikinLiga.online
                </div>
              </div>
              
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sidebar */}
                <div className="hidden md:block col-span-1 space-y-4">
                  <div className="h-10 bg-white/5 rounded w-full dashboard-item" style={{transitionDelay: '200ms'}}></div>
                  <div className="h-10 bg-gradient-to-r from-[#02FE02]/20 to-transparent border-l-2 border-[#02FE02] rounded w-full flex items-center px-3 text-[#02FE02] text-sm font-bold dashboard-item" style={{transitionDelay: '300ms'}}>Klasemen Liga</div>
                  <div className="h-10 bg-white/5 rounded w-full dashboard-item" style={{transitionDelay: '400ms'}}></div>
                  <div className="h-10 bg-white/5 rounded w-full dashboard-item" style={{transitionDelay: '500ms'}}></div>
                </div>
                {/* Main Content */}
                <div className="col-span-2 space-y-4">
                  <div className="flex justify-between items-center mb-6 dashboard-item" style={{transitionDelay: '600ms'}}>
                    <div className="h-8 w-48 bg-white/10 rounded"></div>
                    <div className="h-8 w-24 bg-[#FE00C9] rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    {[
                      {color: 'bg-blue-500', num: 1, delay: '700ms'},
                      {color: 'bg-red-500', num: 2, delay: '800ms'},
                      {color: 'bg-yellow-500', num: 3, delay: '900ms', text: 'text-black'},
                      {color: 'bg-white', num: 4, delay: '1000ms', text: 'text-black'},
                    ].map((item, i) => (
                      <div key={i} className="h-12 bg-white/5 rounded flex items-center px-4 justify-between border border-white/5 dashboard-item hover:bg-white/10 transition-colors cursor-default" style={{transitionDelay: item.delay}}>
                        <div className="flex gap-3">
                          <div className={`w-6 h-6 ${item.color} rounded-full flex items-center justify-center text-[10px] font-bold ${item.text || ''}`}>{item.num}</div>
                          <div className={`h-4 bg-white/20 rounded ${i === 0 || i === 3 ? 'w-32' : 'w-24'}`}></div>
                        </div>
                        <div className={`w-8 h-4 ${i === 0 ? 'bg-[#02FE02]/50' : 'bg-white/10'} rounded`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section (ANIMATED) */}
      <section className="py-10 border-y border-white/5 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem end={500} label="Liga Terbuat" colorClass="text-[#02FE02]" />
            <StatItem end={10000} label="Pertandingan" colorClass="text-white" suffix="k+" /> 
            <StatItem end={5} label="Pemain Terdaftar" colorClass="text-[#FE00C9]" suffix="k+" />
            
            <div className="reveal active text-center">
               <div className="text-3xl md:text-4xl font-display font-bold text-white">
                 24/7
               </div>
               <div className="text-sm text-gray-400 mt-1">Sistem Aktif</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal" ref={useReveal()}>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Fitur <span className="text-[#FE00C9]">Pro Player</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Kami menyediakan alat yang dibutuhkan admin turnamen agar kompetisi berjalan adil, seru, dan profesional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard icon={Users} title="Manajemen Peserta" desc="Input data peserta, nama tim eFootball, dan kontak dengan mudah. Mendukung format liga atau sistem gugur." color="green" delay="" />
            <FeatureCard icon={BarChart2} title="Klasemen Otomatis" desc="Cukup masukkan skor akhir, sistem akan otomatis menghitung poin, selisih gol, dan mengurutkan klasemen." color="pink" delay="100ms" />
            <FeatureCard icon={Calendar} title="Jadwal Pintar" desc="Generate jadwal pertandingan Home & Away secara otomatis tanpa bentrok. Export jadwal ke gambar untuk dishare." color="green" delay="200ms" />
            <FeatureCard icon={Share2} title="Public Link" desc="Setiap turnamen memiliki link unik. Bagikan ke grup WhatsApp atau Discord agar peserta bisa pantau sendiri." color="pink" delay="" />
            <FeatureCard icon={Swords} title="Head-to-Head" desc="Lihat sejarah pertemuan antar player. Siapa yang benar-benar raja eFootball di tongkronganmu." color="green" delay="100ms" />
            <FeatureCard icon={ShieldCheck} title="Validasi Skor" desc="Fitur upload screenshot hasil pertandingan untuk meminimalisir sengketa skor antar pemain." color="pink" delay="200ms" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="cara-kerja" className="py-20 bg-[#121212] border-t border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal relative" ref={useReveal()}>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Mulai Turnamen dalam <span className="text-[#02FE02]">3 Langkah</span></h2>
              
              <div className="step-list-container space-y-4 relative z-10">
                {/* Timeline Lines (Track & Progress) */}
                <div className="hidden md:block absolute left-[calc(1rem+1.25rem-1px)] top-[2.25rem] bottom-[2.25rem] w-[2px] bg-[#333] z-0">
                  {/* Green Progress Line inside the track */}
                  <div 
                    className="w-full bg-[#02FE02] shadow-[0_0_15px_#02FE02] transition-[height] duration-500 ease-in-out"
                    style={{ height: progressHeight }}
                  ></div>
                </div>

                {[
                  { id: 1, title: 'Buat Turnamen', desc: 'Pilih jenis kompetisi (Liga/Cup), atur jumlah peserta, dan sistem poin.' },
                  { id: 2, title: 'Undang Pemain', desc: 'Share link pendaftaran atau input manual nama teman mabar kamu.' },
                  { id: 3, title: 'Main & Update', desc: 'Mainkan match eFootball kalian, input skor, dan lihat klasemen berubah.' },
                ].map((step) => (
                  <div 
                    key={step.id}
                    className={`step-trigger flex gap-4 items-start p-4 rounded-xl border border-transparent relative z-10 ${activeStep === step.id ? 'active' : ''}`}
                    onClick={() => handleStepClick(step.id)}
                  >
                    <div 
                      className={`flex-shrink-0 w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-lg step-circle transition-all relative z-10 
                      ${activeStep >= step.id ? 'bg-[#02FE02] text-black shadow-[0_0_15px_rgba(2,254,2,0.5)] border-[#02FE02]' : 'bg-[#121212] text-white'}`}
                    >
                      {step.id}
                    </div>
                    <div className="pt-1">
                      <h4 className={`text-xl font-bold mb-2 transition-colors ${activeStep === step.id ? 'text-[#02FE02]' : 'text-white'}`}>{step.title}</h4>
                      <p className="text-gray-400 text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pl-14">
                <a href="#" className="text-[#02FE02] font-semibold hover:text-white transition-colors flex items-center gap-2">
                  Pelajari dokumentasi lengkap <div className="w-4 h-4">→</div>
                </a>
              </div>
            </div>

            {/* Animated Visuals Right Side */}
            <div className="relative reveal h-[350px] w-full" ref={useReveal()}>
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#FE00C9]/30 shadow-[0_0_50px_rgba(254,0,201,0.2)] bg-[#1a1a1a]">
                
                {/* Visual Step 1 */}
                <div className={`step-visual ${activeStep === 1 ? 'active' : ''}`}>
                  <div className="w-full max-w-sm p-6 bg-[#252525] rounded-xl border border-white/10 shadow-xl transform transition-all duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded bg-[#02FE02]/20 flex items-center justify-center text-[#02FE02]">
                        <PlusSquare className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-white">Buat Liga Baru</div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-10 bg-black/40 rounded border border-white/5 w-full flex items-center px-3 text-sm text-gray-500">Nama Liga (e.g. Warkop Cup)</div>
                      <div className="flex gap-2">
                        <div className="h-10 bg-[#02FE02] rounded border border-[#02FE02] w-1/2 flex items-center justify-center text-sm text-black font-bold">Liga</div>
                        <div className="h-10 bg-black/40 rounded border border-white/5 w-1/2 flex items-center justify-center text-sm text-gray-500">Cup</div>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded mt-2"></div>
                      <div className="h-8 w-full bg-[#FE00C9] rounded flex items-center justify-center text-sm font-bold mt-4">Simpan</div>
                    </div>
                  </div>
                </div>

                {/* Visual Step 2 */}
                <div className={`step-visual ${activeStep === 2 ? 'active' : ''}`}>
                  <div className="w-full max-w-sm p-6 bg-[#252525] rounded-xl border border-white/10 shadow-xl text-center">
                    <div className="w-16 h-16 bg-[#FE00C9]/20 rounded-full flex items-center justify-center text-[#FE00C9] mx-auto mb-4 animate-bounce">
                      <Share2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-white font-bold mb-2">Undang Teman</h4>
                    <p className="text-xs text-gray-400 mb-4">Bagikan link ini ke grup WhatsApp</p>
                    
                    <div className="bg-black/40 p-3 rounded border border-white/5 flex items-center justify-between mb-4">
                      <span className="text-xs text-[#02FE02] truncate">bikinliga.com/invite/xyz123</span>
                      <Copy className="w-4 h-4 text-gray-400" />
                    </div>

                    <div className="flex justify-center -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#252525]"></div>
                      <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-[#252525]"></div>
                      <div className="w-8 h-8 rounded-full bg-yellow-500 border-2 border-[#252525]"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#252525] flex items-center justify-center text-[10px] text-white">+5</div>
                    </div>
                  </div>
                </div>

                {/* Visual Step 3 */}
                <div className={`step-visual ${activeStep === 3 ? 'active' : ''}`}>
                  <div className="w-full max-w-sm space-y-4 px-6">
                    <div className="bg-[#252525] p-4 rounded-xl border border-white/5 flex items-center justify-between animate-float">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full mb-2"></div>
                        <span className="font-bold text-sm">FCB</span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold font-display text-[#02FE02]">3 - 1</div>
                        <div className="text-xs text-gray-500">FULL TIME</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-red-600 rounded-full mb-2"></div>
                        <span className="font-bold text-sm">MU</span>
                      </div>
                    </div>
                    <div className="bg-[#252525] p-4 rounded-xl border border-white/5 flex items-center justify-between opacity-50 scale-95">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-white rounded-full mb-2"></div>
                        <span className="font-bold text-sm">RMA</span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold font-display text-gray-400">VS</div>
                        <div className="text-xs text-gray-500">20:00</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full mb-2"></div>
                        <span className="font-bold text-sm">ARS</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="py-20 relative">
        <div className="ambient-glow bg-[#02FE02]/20 bottom-10 left-10 w-64 h-64"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal" ref={useReveal()}>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Pilih <span className="text-[#02FE02]">Paketmu</span></h2>
            <p className="text-gray-400">Mulai gratis, upgrade untuk fitur turnamen skala besar.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Free Plan */}
            <div className="glass-panel p-8 rounded-2xl reveal" ref={useReveal()}>
              <h3 className="text-xl font-bold text-gray-300">Komunitas Kecil</h3>
              <div className="my-4">
                <span className="text-4xl font-display font-bold">Rp 0</span>
                <span className="text-gray-500">/bulan</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-400 text-sm">
                {[
                  '1 Turnamen Aktif', 'Maks. 8 Peserta', 'Klasemen Dasar', 'Iklan Tampil'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-[#02FE02]" /> {feature}</li>
                ))}
              </ul>
              <a href="#" className="block w-full py-3 rounded-lg border border-white/20 text-center font-bold hover:bg-white/10 transition">Daftar Gratis</a>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#1a1a1a] p-8 rounded-2xl border-2 border-[#FE00C9] relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(254,0,201,0.15)] reveal" ref={useReveal()}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#FE00C9] text-white text-xs font-bold px-3 py-1 rounded-full">POPULER</div>
              <h3 className="text-xl font-bold text-[#FE00C9]">Rental / Warkop</h3>
              <div className="my-4">
                <span className="text-4xl font-display font-bold text-white">Rp 49rb</span>
                <span className="text-gray-500">/bulan</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-300 text-sm">
                {[
                  'Unlimited Turnamen', 'Maks. 32 Peserta/Liga', 'Export Klasemen ke Image', 'Halaman Publik Custom', 'Tanpa Iklan'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-[#FE00C9]" /> {feature}</li>
                ))}
              </ul>
              <a href="#" className="block w-full py-3 rounded-lg bg-[#FE00C9] text-white text-center font-bold hover:bg-pink-600 transition shadow-lg shadow-pink-500/30">Langganan Sekarang</a>
            </div>

            {/* Organizer Plan */}
            <div className="glass-panel p-8 rounded-2xl reveal" ref={useReveal()}>
              <h3 className="text-xl font-bold text-gray-300">Event Organizer</h3>
              <div className="my-4">
                <span className="text-4xl font-display font-bold">Rp 199rb</span>
                <span className="text-gray-500">/event</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-400 text-sm">
                {[
                  'Bracket Hingga 128 Peserta', 'Sistem Registrasi Online', 'Ticket Management', 'API Access'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-[#02FE02]" /> {feature}</li>
                ))}
              </ul>
              <a href="#" className="block w-full py-3 rounded-lg border border-white/20 text-center font-bold hover:bg-white/10 transition">Hubungi Sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[#121212]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-center mb-10">Pertanyaan Umum</h2>
          
          <div className="space-y-4 reveal" ref={useReveal()}>
            <FaqItem 
              question="Apakah aplikasi ini gratis?" 
              answer="Ya! Paket dasar BikinLiga 100% gratis selamanya untuk komunitas kecil hingga 8 peserta. Cocok untuk mabar sirkel." 
            />
            <FaqItem 
              question="Game apa saja yang didukung?" 
              answer="Fokus utama kami adalah eFootball (PES), namun sistem kami fleksibel dan bisa digunakan untuk FIFA (EA FC), Mobile Legends, atau futsal sungguhan." 
            />
            <FaqItem 
              question="Apakah ada fitur bracket knockout?" 
              answer="Tentu saja. Anda bisa membuat format Full Liga (klasemen), Cup (Gugur), atau Group Stage + Knockout (seperti Piala Dunia)." 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-[#02FE02]" />
                <span className="font-display font-bold text-xl">Bikin<span className="text-[#FE00C9]">Liga</span></span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Platform manajemen turnamen esport termudah untuk komunitas Indonesia.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                {['Fitur', 'Harga', 'API'].map(item => (
                  <li key={item}><a href="#" className="hover:text-[#02FE02] transition">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Dukungan</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                {['Pusat Bantuan', 'Komunitas Discord', 'Kontak Kami'].map(item => (
                  <li key={item}><a href="#" className="hover:text-[#02FE02] transition">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Newsletter</h4>
              <div className="flex flex-col gap-2">
                <input type="email" placeholder="Email kamu" className="bg-white/5 border border-white/10 rounded px-4 py-2 text-sm focus:outline-none focus:border-[#02FE02] text-white" />
                <button className="bg-[#02FE02] text-black font-bold text-sm py-2 rounded hover:bg-[#00c400] transition">Subscribe</button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-600 text-sm">
              &copy; 2024 BikinLiga Indonesia. All rights reserved.
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-gray-500 hover:text-white transition"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-gray-500 hover:text-white transition"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-500 hover:text-white transition"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
