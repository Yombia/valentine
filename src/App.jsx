import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import confetti from 'canvas-confetti';
import bgValentine from './assets/bg-valentine.png';

// 1. Background FX: Partikel melayang untuk kedalaman visual
const MobileSparkle = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: '110dvh', x: `${Math.random() * 100}vw`, opacity: 0 }}
        animate={{ y: '-10dvh', opacity: [0, 0.4, 0] }}
        transition={{ duration: Math.random() * 4 + 4, repeat: Infinity, delay: Math.random() * 5 }}
        className="absolute text-pink-300/30 text-lg"
      >
        ✨
      </motion.div>
    ))}
  </div>
);

// 2. Komponen Teks: Muncul per huruf secara dramatis
const StaggeredText = ({ text, className }) => {
  const letters = Array.from(text);
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.04 * i },
    }),
  };
  const child = {
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 200 } },
    hidden: { opacity: 0, y: 20 },
  };
  return (
    <motion.h2 className={`flex justify-center overflow-hidden ${className}`} variants={container} initial="hidden" animate="visible">
      {letters.map((letter, index) => (
        <motion.span key={index} variants={child}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.h2>
  );
};

export default function App() {
  const [step, setStep] = useState('intro'); // intro, envelope, letter, success, rejected
  const [isOpening, setIsOpening] = useState(false);

  // Fungsi saat Acel memilih YES
  const handleYes = async () => {
    setStep('success');
    confetti({ 
      particleCount: 150, 
      spread: 70, 
      origin: { y: 0.7 },
      colors: ['#ff4d6d', '#ff8e8e', '#ffffff'] 
    });

    // Notifikasi Silent ke Formspree
    try {
      await fetch("https://formspree.io/f/xkozeknn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "MISI BERHASIL: Acel Bilang YES! ❤️",
          message: "Acel telah menerima undangan Valentine Anda.",
          device: navigator.userAgent,
          time: new Date().toLocaleString('id-ID')
        }),
      });
    } catch (error) {
      console.error("Notification failed (silent):", error);
    }
  };

  // Fungsi saat Acel memilih NO
  const handleNo = () => {
    setStep('rejected');
  };

  return (
    <div 
      className="min-h-[100dvh] flex items-center justify-center p-6 overflow-hidden relative"
      style={{ backgroundImage: `url(${bgValentine})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <MobileSparkle />
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-[1]" />

      <div className="relative z-10 w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: GREETING (SAPAAN) */}
          {step === 'intro' && (
            <motion.div 
              key="intro" exit={{ opacity: 0, scale: 0.9 }}
              className="text-center w-full px-4"
            >
              <h1 className="text-4xl font-black text-[#ff4d6d] mb-4 drop-shadow-sm">Hai, Acel. ✨</h1>
              <p className="text-gray-600 mb-10 text-base leading-relaxed italic">"Ada sesuatu yang ingin kusampaikan..."</p>
              <button 
                onClick={() => setStep('envelope')}
                className="w-full max-w-[280px] bg-[#ff4d6d] text-white py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all text-lg"
              >
                Lihat Pesannya
              </button>
            </motion.div>
          )}

          {/* STEP 2: 3D ENVELOPE (AMPLOP) */}
          {step === 'envelope' && (
            <motion.div 
              key="envelope" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-[340px]"
            >
              <div className="relative aspect-[16/10] bg-[#ffb1b1] rounded-2xl shadow-2xl overflow-hidden border-2 border-white/40" style={{ perspective: '1200px' }}>
                <div className="absolute inset-0 bg-[#ffa0a0]" style={{ clipPath: 'polygon(0% 0%, 50% 50%, 100% 0%, 100% 100%, 0% 100%)' }}></div>
                <motion.div 
                  animate={isOpening ? { rotateX: -150 } : { rotateX: 0 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="absolute top-0 left-0 w-full h-full bg-[#ff8e8e] z-10 origin-top shadow-lg" 
                  style={{ clipPath: 'polygon(0 0, 100% 0, 50% 55%)', backfaceVisibility: 'hidden' }}
                />
                {!isOpening && (
                  <motion.button
                    onClick={() => { setIsOpening(true); setTimeout(() => setStep('letter'), 1200); }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-7xl"
                  >
                    ❤️
                  </motion.button>
                )}
              </div>
              <p className="text-center mt-8 text-gray-500 italic text-sm animate-pulse tracking-wide font-medium">Tekan segel hatinya</p>
            </motion.div>
          )}

          {/* STEP 3: PROPOSAL (SURAT) */}
          {step === 'letter' && (
            <motion.div 
              key="letter"
              initial={{ y: '100vh', opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 100, delay: 0.2 }}
              className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border-2 border-pink-200 w-full max-w-[340px] text-center relative overflow-hidden"
            >
              {/* Dekorasi Aksen Kartu */}
              <div className="absolute top-0 left-0 w-12 h-12 bg-pink-100/50 rounded-br-full -z-10"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 bg-pink-100/50 rounded-tl-full -z-10"></div>

              <StaggeredText text="Dear Acel," className="text-3xl font-serif italic text-gray-800 mb-6 font-bold" />
              
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                className="text-gray-600 text-lg mb-10 leading-relaxed italic font-serif"
              >
                Valentine tahun ini nggak akan lengkap kalau nggak bareng kamu...
              </motion.p>
              
              <motion.h3 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.5, type: 'spring' }}
                className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d6d] to-[#ff8e8e] mb-12 uppercase tracking-tight leading-tight"
              >
                WILL YOU BE MY VALENTINE? ❤️
              </motion.h3>
              
              <div className="flex flex-col gap-4 w-full">
                {/* Tombol YES dengan Efek Pulse & Glow */}
                <motion.button 
                  onClick={handleYes}
                  animate={{ scale: [1, 1.05, 1], boxShadow: ['0px 10px 15px -3px rgba(34, 197, 94, 0.4)', '0px 20px 25px -5px rgba(34, 197, 94, 0.6)', '0px 10px 15px -3px rgba(34, 197, 94, 0.4)'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-5 rounded-2xl font-black text-xl shadow-lg border-b-4 border-green-600 active:border-b-0 active:translate-y-1 transition-all relative overflow-hidden"
                >
                  <span className="relative z-10">YES! 💚</span>
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                    className="absolute inset-0 w-1/3 h-full bg-white/20 skew-x-12 blur-sm"
                  />
                </motion.button>

                {/* Tombol NO yang Diterima Apa Adanya */}
                <button 
                  onClick={handleNo}
                  className="w-full bg-gray-200 text-gray-500 py-4 rounded-2xl font-bold opacity-80 text-lg active:scale-95 transition-all"
                >
                  No
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CELEBRATION (SUKSES) */}
          {step === 'success' && (
            <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center px-6">
              <span className="text-8xl mb-4 block">🥰</span>
              <h1 className="text-4xl font-black text-[#ff4d6d] leading-tight drop-shadow-md">I KNEW IT! ❤️</h1>
              <p className="mt-4 text-gray-500 text-xl italic font-serif tracking-wide">Sampai jumpa nanti, Acel.</p>
            </motion.div>
          )}

          {/* STEP 5: GRACEFUL REJECTION (DITOLAK) */}
          {step === 'rejected' && (
            <motion.div key="rejected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center px-6">
              <span className="text-8xl mb-4 block">😢</span>
              <h1 className="text-3xl font-bold text-gray-600">Terima kasih, Acel.</h1>
              <p className="mt-4 text-gray-500 text-lg italic font-serif">"Kejujuranmu sangat aku hargai. Tetap berteman ya?" 😊</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}