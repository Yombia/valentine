// components/AudioPlayer.jsx
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const AudioPlayer = ({ src }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  const startAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setShowPrompt(false);
        })
        .catch(err => console.log('Audio play failed:', err));
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    // Auto-play attempt after first user interaction
    const handleFirstInteraction = () => {
      startAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} loop>
        <source src={src} type="audio/mpeg" />
      </audio>

      {/* Music prompt overlay */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={startAudio}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm text-center shadow-2xl"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-5xl mb-4"
              >
                🎵
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Nyalakan Musik?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Pengalaman lebih romantis dengan musik
              </p>
              <button className="bg-pink-500 text-white px-6 py-3 rounded-full font-medium hover:bg-pink-600 transition-colors">
                Putar Musik ▶
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music control button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: showPrompt ? 0 : 1, scale: showPrompt ? 0 : 1 }}
        onClick={toggleAudio}
        className="fixed bottom-6 right-6 bg-pink-500 text-white p-4 rounded-full shadow-lg z-40 hover:bg-pink-600 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPlaying ? '🔊' : '🔇'}
      </motion.button>
    </>
  );
};