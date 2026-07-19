import React, { useRef, useEffect } from 'react';
import { prefersReducedMotion } from '@/lib/kit';

interface NoiseProps {
  patternRefreshInterval?: number;
  patternAlpha?: number;
}

const Noise: React.FC<NoiseProps> = ({ patternRefreshInterval = 0, patternAlpha = 8 }) => {
  const grainRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let frame = 0;
    let animationId = 0;
    const canvasSize = 512;
    const isStatic = patternRefreshInterval <= 0 || prefersReducedMotion();

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const drawGrain = () => {
      const imageData = ctx.createImageData(canvasSize, canvasSize);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = patternAlpha;
      }
      ctx.putImageData(imageData, 0, 0);
    };

    drawGrain();

    if (!isStatic) {
      const loop = () => {
        if (frame % patternRefreshInterval === 0) {
          drawGrain();
        }
        frame++;
        animationId = window.requestAnimationFrame(loop);
      };
      loop();
    }

    return () => {
      if (animationId) window.cancelAnimationFrame(animationId);
    };
  }, [patternRefreshInterval, patternAlpha]);

  return (
    <canvas
      className="pointer-events-none fixed inset-0 h-full w-full"
      aria-hidden="true"
      ref={grainRef}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default Noise;
