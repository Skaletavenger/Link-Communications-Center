'use client';
import Lottie from 'lottie-react';

export default function LottieLoader({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <div className={className}>
      <Lottie animationData={require('../public/lottie-sample.json')} loop autoplay />
    </div>
  );
}
