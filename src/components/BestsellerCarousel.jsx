import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';

export default function BestsellerCarousel({ products }) {
  const trackRef = useRef(null);
  const hoveredRef = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || products.length < 2) return;
    const timer = window.setInterval(() => {
      const track = trackRef.current;
      if (!track || document.hidden || hoveredRef.current || track.contains(document.activeElement)) return;
      const cards = [...track.children];
      const first = cards[0];
      const step = cards[1]?.offsetLeft - first.offsetLeft;
      const max = track.scrollWidth - track.clientWidth;
      if (!step || max <= 1) return;
      const next = track.scrollLeft >= max - 2 ? 0 : Math.min(max, (Math.round(track.scrollLeft / step) + 1) * step);
      track.scrollTo({ left: next, behavior: 'smooth' });
    }, 6000);
    return () => window.clearInterval(timer);
  }, [products.length, reduceMotion]);

  return (
    <div
      ref={trackRef}
      className="flex items-stretch gap-4 sm:gap-gutter overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
      aria-live="off"
    >
      {products.map(product => (
        <div key={product.id} className="min-w-0 flex-shrink-0 w-[calc((100%-1rem)/2)] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)] snap-start">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
