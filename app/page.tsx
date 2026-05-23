import dynamic from 'next/dynamic';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { seedProducts } from '../lib/seed';

export default function Home() {
  const products = seedProducts.slice(0, 3);
  return (
    <main className="relative overflow-hidden">
      <Hero />
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-6">Featured Surveillance Cameras</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.model} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
