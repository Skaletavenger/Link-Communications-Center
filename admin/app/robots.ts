import { MetadataRoute } from 'next'

// The admin dashboard must never appear in search engines.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: '/' },
  }
}
