'use client'

export function useHomeAuth() {
  return {
    loggedIn: true,
    authReady: true,
    authHref: '/#products',
    productsHref: '/#products',
  }
}
