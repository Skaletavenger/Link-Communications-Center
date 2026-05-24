'use client';
import { useEffect, useMemo, useState } from 'react';
import type { Product as ProductType } from '../types';

export type Product = ProductType & {
  id: string;
  description: string;
};

export const INVENTORY_KEY = 'lcc_inventory';
export const categories = [
  'Surveillance Cameras',
  'Access Control',
  'Networking',
  'Intercoms',
  'Alarms',
  'Other'
];

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'HIK Vision Dome Camera',
    brand: 'HIK Vision',
    model: 'DS-2CD2143G2-I',
    category: 'Surveillance Cameras',
    price: 85,
    stockQuantity: 12,
    description: '4MP AcuSense Fixed Dome Network Camera',
    image: '/images/products/hikvision-dome.jpg'
  },
  {
    id: '2',
    name: 'HIK Vision Bullet Camera',
    brand: 'HIK Vision',
    model: 'DS-2CD2347G2-LU',
    category: 'Surveillance Cameras',
    price: 110,
    stockQuantity: 8,
    description: '4MP ColorVu Fixed Turret Network Camera',
    image: '/images/products/hikvision-bullet.jpg'
  },
  {
    id: '3',
    name: 'HIK Vision PTZ Camera',
    brand: 'HIK Vision',
    model: 'DS-2DE4425IWG-E',
    category: 'Surveillance Cameras',
    price: 245,
    stockQuantity: 4,
    description: '4MP 25x Network Speed Dome',
    image: '/images/products/hikvision-ptz.jpg'
  },
  {
    id: '4',
    name: 'HIK Vision NVR 8 Channel',
    brand: 'HIK Vision',
    model: 'DS-7608NXI-K2',
    category: 'Networking',
    price: 320,
    stockQuantity: 5,
    description: '8 Channel AcuSense Network Video Recorder',
    image: ''
  },
  {
    id: '5',
    name: 'HIK Vision Video Doorbell',
    brand: 'HIK Vision',
    model: 'DS-KV8113-WME1',
    category: 'Intercoms',
    price: 95,
    stockQuantity: 3,
    description: 'Video Door Phone with WiFi',
    image: ''
  }
];

function createProductId() {
  return Date.now().toString();
}

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(INVENTORY_KEY) : null;
    if (stored) {
      try {
        setProducts(JSON.parse(stored) as Product[]);
        setLoaded(true);
        return;
      } catch {
        // fall through to default
      }
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(defaultProducts));
    }
    setProducts(defaultProducts);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(products));
  }, [products, loaded]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...product, id: createProductId() };
    setProducts((current) => [newProduct, ...current]);
  };

  const updateProduct = (product: Product) => {
    setProducts((current) => current.map((item) => (item.id === product.id ? product : item)));
  };

  const deleteProduct = (id: string) => {
    setProducts((current) => current.filter((item) => item.id !== id));
  };

  const categoryTotals = useMemo(
    () => categories.reduce((acc, category) => ({ ...acc, [category]: products.filter((product) => product.category === category).length }), {} as Record<string, number>),
    [products]
  );

  return { products, loaded, addProduct, updateProduct, deleteProduct, categories, categoryTotals };
}
