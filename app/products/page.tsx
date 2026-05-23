import ProductCard from '../../components/ProductCard';
import { seedProducts } from '../../lib/seed';

export default function ProductsPage() {
  const products = seedProducts;
  return (
    <section className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">Products</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p.model} product={p} />
        ))}
      </div>
    </section>
  );
}
