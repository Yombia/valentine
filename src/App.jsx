import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const Polaroid = ({ src, caption, rotation }) => (
  <motion.div 
    whileHover={{ scale: 1.05, rotate: 0 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    style={{ rotate: rotation }}
    className="bg-white p-2 pb-6 md:p-3 md:pb-8 shadow-xl border border-gray-100 w-[140px] md:w-52 inline-block mx-2 mb-4"
  >
    <div className="bg-gray-200 w-full h-28 md:h-44 overflow-hidden mb-2 md:mb-3">
      <img src={src} alt={caption} className="w-full h-full object-cover" />
    </div>
    <p className="text-center font-serif text-[10px] md:text-sm text-gray-700 italic px-1">{caption}</p>
  </motion.div>
);

function App() {
  const [step, setStep] = useState(1);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const memories = [
    { src: 'https://via.placeholder.com/300', caption: 'Momen Pertama', rotate: '-3deg' },
    { src: 'https://via.placeholder.com/300', caption: 'Tawa Bersama', rotate: '4deg' },
    { src: 'https://via.placeholder.com/300', caption: 'Favorit Kita', rotate: '-2deg' },
    { src: 'https://via.placeholder.com/300', caption: 'Soon on Feb 14', rotate: '5deg' },
  ];

  const moveNoButton = () => {
    // Memberikan margin aman 100px agar tombol tidak mepet ke tepi layar
    const safeMargin = 100;
    const randomX = Math.random() * (window.innerWidth - safeMargin * 2) + safeMargin;
    const randomY = Math.random() * (window.innerHeight - safeMargin * 2) + safeMargin;
    setNoButtonPos({ x: randomX, y: randomY });
  };

  const handleYes = () => {
    setStep(4);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    
    const phoneNumber = "628xxxxxxxxxx"; // Sesuaikan nomor Anda
    const message = encodeURIComponent("Pangeran! Acel bilang YES! ❤️");
    setTimeout(() => window.open(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`, '_blank'), 2000);
  };

  return (
    <div className="min-h-[100dvh] bg-[#fff5f7] flex items-center justify-center p-4 overflow-hidden relative font-sans">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: HERO */}
        {step === 1 && (
          <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-valentine-red mb-6">Hai, Acel. ✨</h1>
            <p className="text-gray-600 mb-10 text-base md:text-lg max-w-xs mx-auto">Aku sudah merangkum perjalanan kita di sini...</p>
            <button onClick={() => setStep(2)} className="w-full md:w-auto bg-valentine-red text-white px-10 py-4 rounded-full shadow-2xl font-bold active:scale-95 transition-transform">
              Buka Memori
            </button>
          </motion.div>
        )}

        {/* STEP 2: POLAROID GALLERY */}
        {step === 2 && (
          <motion.div key="memories" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center w-full max-w-4xl max-h-screen overflow-y-auto py-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">Memori Favoritku...</h2>
            <div className="flex flex-wrap justify-center gap-2 md:gap-6 mb-12 px-2">
              {memories.map((m, i) => (
                <Polaroid key={i} src={m.src} caption={m.caption} rotation={m.rotate} />
              ))}
            </div>
            <button onClick={() => setStep(3)} className="text-valentine-red font-bold text-lg md:text-xl">
              Ada satu hal lagi... ⮕
            </button>
          </motion.div>
        )}

        {/* STEP 3: THE PROPOSAL */}
        {step === 3 && (
          <motion.div key="proposal" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center relative w-full h-full flex flex-col items-center justify-center">
            <h2 className="text-3xl md:text-6xl font-bold text-valentine-red mb-12 md:mb-20 px-4">Will you be my Valentine, Acel? ❤️</h2>
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center w-full justify-center">
              <button onClick={handleYes} className="z-10 bg-green-500 text-white px-14 py-5 rounded-2xl text-2xl font-black shadow-2xl active:scale-90 transition-all">
                YES!
              </button>
              <motion.button
                onMouseEnter={moveNoButton}
                onTouchStart={moveNoButton} // Dukungan khusus untuk HP
                animate={{ 
                  x: noButtonPos.x ? noButtonPos.x - (window.innerWidth / 2) : 0, 
                  y: noButtonPos.y ? noButtonPos.y - (window.innerHeight / 2) : 0 
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="bg-gray-400 text-white px-10 py-3 rounded-xl md:absolute cursor-not-allowed"
              >
                No
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center px-4">
            <h1 className="text-7xl md:text-8xl mb-6">💖</h1>
            <h2 className="text-4xl md:text-5xl font-extrabold text-valentine-red">I KNEW IT!</h2>
            <p className="mt-4 text-gray-600 italic">See you soon, Acel.</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

export default App;