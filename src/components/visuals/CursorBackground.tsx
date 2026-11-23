import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
}

export const CursorBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse coordinates with linear interpolation
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const targetMousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isPointerDevice, setIsPointerDevice] = useState(true);

  useEffect(() => {
    // Check if device has fine pointer (mouse)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsPointerDevice(mediaQuery.matches);
    const handleMediaChange = (e: MediaQueryListEvent) => setIsPointerDevice(e.matches);
    mediaQuery.addEventListener('change', handleMediaChange);

    const handleMouseMove = (e: MouseEvent) => {
      targetMousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize cyber network particles
    const particleCount = Math.min(65, Math.floor((width * height) / 22000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.8 + 1,
        alpha: Math.random() * 0.4 + 0.15,
        baseAlpha: Math.random() * 0.4 + 0.15
      });
    }

    const render = () => {
      // Smooth interpolation for mouse position
      mousePos.current.x += (targetMousePos.current.x - mousePos.current.x) * 0.06;
      mousePos.current.y += (targetMousePos.current.y - mousePos.current.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // Render interactive network nodes & connections
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particles
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Interaction with mouse cursor
        const dx = mousePos.current.x - p.x;
        const dy = mousePos.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 180;

        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * 0.6;
          p.x -= (dx / dist) * force;
          p.y -= (dy / dist) * force;
          p.alpha = Math.min(0.85, p.baseAlpha + force * 0.6);
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.02;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 227, 255, ${p.alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#22E3FF';
        ctx.fill();

        // Draw network connections between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          const maxConnect = 110;

          if (cdist < maxConnect) {
            const lineAlpha = (1 - cdist / maxConnect) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(47, 107, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full min-h-screen overflow-hidden bg-[#040813]">
      {/* Dynamic Cursor Light Fields */}
      {isPointerDevice && (
        <div
          className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
          style={{
            background: `
              radial-gradient(750px circle at ${mousePos.current.x}px ${mousePos.current.y}px, rgba(34, 227, 255, 0.07), transparent 60%),
              radial-gradient(900px circle at ${mousePos.current.x * 0.8}px ${mousePos.current.y * 0.8}px, rgba(47, 107, 255, 0.09), transparent 70%),
              radial-gradient(1100px circle at ${mousePos.current.x * 1.2}px ${mousePos.current.y * 1.2}px, rgba(139, 92, 246, 0.05), transparent 80%)
            `
          }}
        />
      )}

      {/* Cyber Mesh Grid Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Interactive Network Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0 opacity-60"
      />

      {/* Content wrapper */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
