// components/FloatingHearts.jsx
import { useEffect, useRef } from 'react';

export const FloatingHearts = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Heart particles
    const hearts = Array.from({ length: 15 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 15 + 8,
      speedY: Math.random() * 0.5 + 0.3,
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.3 + 0.1,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02
    }));

    // Draw heart shape
    const drawHeart = (x, y, size, opacity, angle) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#ff69b4';
      
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      // Left curve
      ctx.bezierCurveTo(
        -size / 2, -topCurveHeight,
        -size, topCurveHeight / 2,
        -size / 2, size * 0.8
      );
      // Bottom point
      ctx.lineTo(0, size);
      // Right curve
      ctx.lineTo(size / 2, size * 0.8);
      ctx.bezierCurveTo(
        size, topCurveHeight / 2,
        size / 2, -topCurveHeight,
        0, topCurveHeight
      );
      ctx.fill();
      ctx.restore();
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      hearts.forEach(heart => {
        drawHeart(heart.x, heart.y, heart.size, heart.opacity, heart.angle);
        
        // Update position
        heart.y -= heart.speedY;
        heart.x += heart.speedX;
        heart.angle += heart.rotationSpeed;
        
        // Reset if out of bounds
        if (heart.y < -heart.size) {
          heart.y = canvas.height + heart.size;
          heart.x = Math.random() * canvas.width;
        }
        if (heart.x < -heart.size) heart.x = canvas.width + heart.size;
        if (heart.x > canvas.width + heart.size) heart.x = -heart.size;
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ willChange: 'transform' }}
    />
  );
};