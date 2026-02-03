import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import bgValentine from './assets/bg-valentine.png';

// --- HELPER: Texture Partikel SATU WARNA GRADASI ---
const createParticleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  // Menggunakan satu rona warna pink (sesuai tema #ff4d6d), hanya beda opacity
  gradient.addColorStop(0, 'rgba(255, 77, 109, 1)');   // Inti padat
  gradient.addColorStop(0.5, 'rgba(255, 77, 109, 0.5)'); // Tengah memudar
  gradient.addColorStop(1, 'rgba(255, 77, 109, 0)');     // Pinggir transparan
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
};

// --- KOMPONEN: Jantung Pixel Ultra-Ramping & Natural ---
const HeartParticles = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const particlesCount = 6000; 
    const geometry = new THREE.BufferGeometry();
    const currentPos = new Float32Array(particlesCount * 3);
    const targetPos = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    // WARNA TUNGGAL UNTUK SEMUA PARTIKEL
    const solidPink = new THREE.Color(0xff4d6d); // Warna tema utama

    for (let i = 0; i < particlesCount; i++) {
        const t = Math.random() * Math.PI * 2;
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        
        let z = (Math.random() - 0.5) * 0.5; // Ultra tipis
        const spread = 1 + (Math.random() * 0.1); 
        
        targetPos[i*3] = x * spread;
        targetPos[i*3+1] = y * spread;
        targetPos[i*3+2] = z;

        currentPos[i*3] = 0;
        currentPos[i*3+1] = 0;
        currentPos[i*3+2] = 0;

        // Tidak ada lagi pencampuran (lerp). Semua pakai warna yang sama.
        colors[i*3] = solidPink.r;
        colors[i*3+1] = solidPink.g;
        colors[i*3+2] = solidPink.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(currentPos, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleTexture = createParticleTexture();
    const material = new THREE.PointsMaterial({
      size: window.innerHeight * 0.001,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const mesh = new THREE.Points(geometry, material);
    const baseScale = 1.6; 
    mesh.scale.set(baseScale, baseScale, baseScale);
    scene.add(mesh);
    camera.position.z = 100;

    let startTime = null;
    const buildDuration = 0.8; 

    const animate = (time) => {
        requestAnimationFrame(animate);
        if (!startTime) startTime = time;
        const elapsed = (time - startTime) / 1000;
        const positions = geometry.attributes.position.array;

        if (elapsed < buildDuration) {
            const progress = elapsed / buildDuration;
            const easeProgress = 1 - Math.pow(1 - progress, 4); 

            for (let i = 0; i < particlesCount; i++) {
                const ix = i * 3;
                positions[ix] = targetPos[ix] * easeProgress;
                positions[ix+1] = targetPos[ix+1] * easeProgress;
                positions[ix+2] = targetPos[ix+2] * easeProgress;
            }
            geometry.attributes.position.needsUpdate = true;

        } else {
            const sway = Math.sin(elapsed * 0.8) * 0.05; 
            mesh.rotation.z = sway;
            const pulseFactor = 1 + Math.sin(elapsed * 1.5) * 0.01;
            mesh.scale.set(baseScale * pulseFactor, baseScale * pulseFactor, baseScale * pulseFactor);
        }
        renderer.render(scene, camera);
    };

    animate(0);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      particleTexture.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 77, 109, 0.6))' }} />;
};

// --- KOMPONEN PENDUKUNG ---
const MobileSparkle = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    {[...Array(10)].map((_, i) => (
      <motion.div key={i} initial={{ y: '110dvh', x: `${Math.random() * 100}vw`, opacity: 0 }}
        animate={{ y: '-10dvh', opacity: [0, 0.4, 0] }}
        transition={{ duration: Math.random() * 4 + 4, repeat: Infinity, delay: Math.random() * 5 }}
        className="absolute text-pink-300/30 text-lg">✨</motion.div>
    ))}
  </div>
);

const StaggeredText = ({ text, className }) => {
  const letters = Array.from(text);
  const container = { hidden: { opacity: 0 }, visible: (i = 1) => ({ opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.04 * i } }) };
  const child = { visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 200 } }, hidden: { opacity: 0, y: 20 } };
  return (
    <motion.h2 className={`flex justify-center overflow-hidden ${className}`} variants={container} initial="hidden" animate="visible">
      {letters.map((letter, index) => (<motion.span key={index} variants={child}>{letter === " " ? "\u00A0" : letter}</motion.span>))}
    </motion.h2>
  );
};

// --- APLIKASI UTAMA ---
export default function App() {
  const [step, setStep] = useState('intro'); 
  const [isOpening, setIsOpening] = useState(false);
  const [customReason, setCustomReason] = useState("");

  const sendStatus = async (status, reason = "") => {
    try {
      await fetch("https://formspree.io/f/xkozeknn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `VALENTINE UPDATE: ${status}`,
          message: reason ? `Alasan: ${reason}` : "Acel memberikan jawaban YES!",
          location: "Medan", campus: "UNIMED", time: new Date().toLocaleString('id-ID')
        }),
      });
    } catch (e) { console.error(e); }
  };

  const handleYes = () => {
    setStep('success');
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.7 } });
    sendStatus("YES ❤️");
  };

  const handleReasonSubmit = (reason) => {
    const finalReason = reason === "custom" ? customReason : reason;
    if (!finalReason) return;
    setStep('rejected');
    sendStatus("NO 💔", finalReason);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-6 overflow-hidden relative font-sans"
         style={{ backgroundImage: `url(${bgValentine})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <MobileSparkle />
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-[1]" />

      <div className="relative z-10 w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          
          {step === 'intro' && (
            <motion.div key="intro" exit={{ opacity: 0 }} className="text-center w-full px-4">
              <h1 className="text-4xl font-black text-[#ff4d6d] mb-4">Hai, Acel. ✨</h1>
              <p className="text-gray-600 mb-10 italic">ada yang pengen ku bilang cman gaberani langsung hehe</p>
              <button onClick={() => setStep('envelope')} className="w-full max-w-[280px] bg-[#ff4d6d] text-white py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all text-lg">Coba tekan</button>
            </motion.div>
          )}

          {step === 'envelope' && (
  <motion.div key="envelope" className="w-full max-w-[340px]">
    <div className="relative aspect-[16/10] bg-[#ffb1b1] rounded-2xl shadow-2xl overflow-hidden border-2 border-white/40" style={{ perspective: '1200px' }}>
      <div className="absolute inset-0 bg-[#ffa0a0]" style={{ clipPath: 'polygon(0% 0%, 50% 50%, 100% 0%, 100% 100%, 0% 100%)' }}></div>
      <motion.div animate={isOpening ? { rotateX: -150 } : { rotateX: 0 }} transition={{ duration: 1 }}
        className="absolute top-0 left-0 w-full h-full bg-[#ff8e8e] z-10 origin-top shadow-lg" 
        style={{ clipPath: 'polygon(0 0, 100% 0, 50% 55%)', backfaceVisibility: 'hidden' }} />
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
    {/* INTRUKSI BARU DI BAWAH AMPLOP */}
    <p className="text-center mt-8 text-gray-500 italic text-sm animate-pulse tracking-wide font-medium">
      Tekan love nya coba Cel ✨
    </p>
  </motion.div>
)}

          {step === 'letter' && (
            <motion.div key="letter" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-white/95 p-8 rounded-3xl shadow-2xl border-2 border-pink-200 w-full max-w-[340px] text-center">
              <StaggeredText text="Dear Acel," className="text-3xl font-serif italic text-gray-800 mb-6 font-bold" />
              <p className="text-gray-600 text-lg mb-8 leading-relaxed font-serif italic text-left px-2">
                Aku tau kalau sekarang bukan lah waktu yang tepat, mengingat urusan-urusan mu yang lagi kau hadapi... <br/><br/>
                Tapi yang pasti, aku bakal sesalkan ini seumur hidupku kalau gak ku tanya.
              </p>
              <h3 className="text-xl font-black text-[#ff4d6d] mb-12 uppercase tracking-tighter">Mau ga acel valentine bareng samaku ? ❤️</h3>
              <div className="flex flex-col gap-4">
                <button onClick={handleYes} className="bg-green-500 text-white py-5 rounded-2xl font-black text-xl shadow-lg active:scale-90 transition-all">Mau Yos</button>
                <button onClick={() => setStep('reason')} className="bg-gray-200 text-gray-500 py-4 rounded-2xl font-bold opacity-80 active:scale-95">Maaf, gabisa</button>
              </div>
            </motion.div>
          )}

          {step === 'reason' && (
            <motion.div key="reason" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white/95 p-8 rounded-3xl shadow-2xl w-full max-w-[340px] text-center border-2 border-gray-100 max-h-[80dvh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-700 mb-6 font-serif italic text-left px-2">Kenapa tuh, Cel? 😊</h2>
              <div className="flex flex-col gap-3">
                {["Skripsi ku yos", "Belum boleh keluar 🏠", "Maunya temenan aja 🤝"].map((r, i) => (
                  <button key={i} onClick={() => handleReasonSubmit(r)} className="p-4 bg-pink-50 text-gray-700 rounded-xl text-sm border border-pink-100 transition-all active:scale-95">{r}</button>
                ))}
                <div className="flex flex-col gap-2 mt-2">
                  <textarea placeholder="Atau tulis alasan acel di sini..."
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-pink-300 min-h-[100px]"
                    value={customReason} onChange={(e) => setCustomReason(e.target.value)} />
                  <button disabled={!customReason} onClick={() => handleReasonSubmit("custom")} className="bg-pink-400 text-white py-3 rounded-xl font-bold disabled:opacity-50 active:scale-95">Kirim Alasan</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 flex flex-col items-center justify-center z-50 pointer-events-none">
              <HeartParticles />
              <div className="relative z-30 text-center px-6" style={{ textShadow: '0 2px 15px rgba(255,77,109,0.8)' }}>
                <h1 className="text-4xl md:text-6xl font-black text-[#ff4d6d] mb-4">ASIKKKK! ❤️</h1>
                <p className="text-white text-xl italic font-serif bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 inline-block shadow-xl">
                  Acel gak bakal nyesal bilang iya, sumpah aku!
                </p>
              </div>
            </motion.div>
          )}

          {step === 'rejected' && (
            <motion.div key="rejected" className="text-center px-6">
              <span className="text-8xl mb-4 block">🤝</span>
              <h1 className="text-3xl font-bold text-gray-600">Makasih, Acel.</h1>
              <p className="mt-4 text-gray-500 text-lg italic">Jawabanmu aku hargai. Kita tetap berteman baik ya!</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}