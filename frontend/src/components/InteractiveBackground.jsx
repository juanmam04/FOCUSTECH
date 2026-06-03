import { useEffect, useRef } from 'react';
import './InteractiveBackground.css';

const PARTICLE_COUNT = 48;
const MOUSE_RADIUS = 280;

function createParticles(width, height) {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    size: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.35 + 0.1,
  }));
}

export default function InteractiveBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const particlesRef = useRef([]);
  const frameRef = useRef(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = createParticles(w, h);

      if (mouseRef.current.tx === 0 && mouseRef.current.ty === 0) {
        mouseRef.current = { x: w * 0.7, y: h * 0.4, tx: w * 0.7, ty: h * 0.4 };
      }
    };

    const onMove = (e) => {
      mouseRef.current.tx = e.clientX;
      mouseRef.current.ty = e.clientY;
    };

    const onTouch = (e) => {
      if (e.touches[0]) {
        mouseRef.current.tx = e.touches[0].clientX;
        mouseRef.current.ty = e.touches[0].clientY;
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });

    const orbs = [
      { x: 0.75, y: 0.35, r: 320, hue: [192, 38, 211] },
      { x: 0.15, y: 0.7, r: 260, hue: [109, 40, 217] },
      { x: 0.5, y: 0.85, r: 200, hue: [147, 51, 234] },
    ];

    const draw = (time) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const t = time * 0.001;

      const mx = mouseRef.current;
      mx.x += (mx.tx - mx.x) * 0.06;
      mx.y += (mx.ty - mx.y) * 0.06;

      ctx.fillStyle = '#030303';
      ctx.fillRect(0, 0, w, h);

      if (!reducedMotionRef.current) {
        orbs.forEach((orb, i) => {
          const ox = orb.x * w + Math.sin(t * 0.4 + i) * 40;
          const oy = orb.y * h + Math.cos(t * 0.35 + i * 1.2) * 30;
          const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r);
          grad.addColorStop(0, `rgba(${orb.hue.join(',')}, 0.14)`);
          grad.addColorStop(0.5, `rgba(${orb.hue.join(',')}, 0.04)`);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        });

        const cursorGrad = ctx.createRadialGradient(mx.x, mx.y, 0, mx.x, mx.y, MOUSE_RADIUS);
        cursorGrad.addColorStop(0, 'rgba(192, 38, 211, 0.18)');
        cursorGrad.addColorStop(0.4, 'rgba(124, 58, 237, 0.06)');
        cursorGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = cursorGrad;
        ctx.fillRect(0, 0, w, h);

        particlesRef.current.forEach((p) => {
          const dx = mx.x - p.x;
          const dy = mx.y - p.y;
          const dist = Math.hypot(dx, dy);
          const force = dist < MOUSE_RADIUS ? (1 - dist / MOUSE_RADIUS) * 0.8 : 0;

          if (force > 0 && dist > 1) {
            p.vx += (dx / dist) * force * 0.02;
            p.vy += (dy / dist) * force * 0.02;
          }

          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.99;
          p.vy *= 0.99;

          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;

          const glow = dist < MOUSE_RADIUS ? p.alpha + force * 0.4 : p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(228, 180, 255, ${Math.min(glow, 0.7)})`;
          ctx.fill();
        });

        ctx.strokeStyle = 'rgba(255,255,255,0.02)';
        ctx.lineWidth = 1;
        const gridStep = 80;
        const offsetX = (mx.x * 0.02) % gridStep;
        const offsetY = (mx.y * 0.02) % gridStep;
        for (let x = -gridStep; x < w + gridStep; x += gridStep) {
          ctx.beginPath();
          ctx.moveTo(x + offsetX, 0);
          ctx.lineTo(x + offsetX, h);
          ctx.stroke();
        }
        for (let y = -gridStep; y < h + gridStep; y += gridStep) {
          ctx.beginPath();
          ctx.moveTo(0, y + offsetY);
          ctx.lineTo(w, y + offsetY);
          ctx.stroke();
        }
      } else {
        const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.6);
        grad.addColorStop(0, 'rgba(192, 38, 211, 0.12)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, []);

  return (
    <div className="interactive-bg" aria-hidden>
      <canvas ref={canvasRef} className="interactive-bg__canvas" />
      <div className="interactive-bg__vignette" />
    </div>
  );
}
