import { MetadataRoute } from 'next'
import { fetchAllProducts } from '../lib/products-server'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://linkcommunicationscenter.com'

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/loans`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const products = await fetchAllProducts()
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticEntries, ...productEntries]
}
