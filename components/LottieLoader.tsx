'use client';
import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

export default function LottieLoader({ src = '/animations/hero-security-camera.json', className = 'w-24 h-24' }: { src?: string; className?: string }) {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(src);
        const json = await res.json();
        if (mounted) setData(json);
      } catch (e) {
        console.warn('Failed to load lottie', src, e);
      }
    })();
    return () => { mounted = false };
  }, [src]);

  if (!data) return <div className={className} />;
  return (
    <div className={className}>
      <Lottie animationData={data} loop autoplay />
    </div>
  );
}
