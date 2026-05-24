import { Product } from '../types';

export const seedProducts: Product[] = [
  {
    id: 'seed-1',
    name: 'HIK Vision Dome',
    brand: 'HIK Vision',
    model: 'DS-2CD2143G2-I',
    category: 'Surveillance Cameras',
    price: 249,
    stockQuantity: 12,
    description: '4MP dome camera for professional surveillance',
    image: '/placeholder.svg'
  },
  {
    id: 'seed-2',
    name: 'HIK Vision Bullet',
    brand: 'HIK Vision',
    model: 'DS-2CD2347G2-LU',
    category: 'Surveillance Cameras',
    price: 399,
    stockQuantity: 4,
    description: 'ColorVu bullet camera with low-light performance',
    image: '/placeholder.svg'
  },
  {
    id: 'seed-3',
    name: 'HIK Vision PTZ',
    brand: 'HIK Vision',
    model: 'DS-2DE4425IWG-E',
    category: 'Surveillance Cameras',
    price: 899,
    stockQuantity: 0,
    description: 'High-speed PTZ dome for long-range monitoring',
    image: '/placeholder.svg'
  }
];
