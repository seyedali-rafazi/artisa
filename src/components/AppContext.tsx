"use client"

import React, { createContext, useContext, useState } from "react"

export interface CartItem {
  id: string
  name: string
  nameEn: string
  price: number
  quantity: number
  image: string
}

export interface Product {
  id: string
  name: string
  nameEn: string
  price: number
  oldPrice?: number
  image: string
  category: string
  categoryEn: string
  rating: number
  isSpecial?: boolean
  isBestSeller?: boolean
  description?: string
  descriptionEn?: string
  specifications?: Record<string, string>
}

type View = "home" | "product-details" | "cart" | "checkout" | "checkout-success" | "track-order" | "about-us" | "contact-us" | "blog" | "faq"

interface AppContextType {
  currentView: View
  setCurrentView: (view: View) => void
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateCartQty: (productId: string, qty: number) => void
  clearCart: () => void
  compareList: Product[]
  toggleCompare: (product: Product) => void
  clearCompare: () => void
  selectedProduct: Product | null
  setSelectedProduct: (product: Product | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  showLogin: boolean
  setShowLogin: (show: boolean) => void
  user: { name: string; email: string } | null
  setUser: (user: { name: string; email: string } | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState<View>("home")
  const [cart, setCart] = useState<CartItem[]>([])
  const [compareList, setCompareList] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          nameEn: product.nameEn,
          price: product.price,
          quantity: 1,
          image: product.image,
        },
      ]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: qty } : item))
    )
  }

  const clearCart = () => setCart([])

  const toggleCompare = (product: Product) => {
    setCompareList((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      if (exists) {
        return prev.filter((p) => p.id !== product.id)
      }
      if (prev.length >= 3) {
        // limit to 3 products
        alert("You can compare up to 3 products only.")
        return prev
      }
      return [...prev, product]
    })
  }

  const clearCompare = () => setCompareList([])

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        compareList,
        toggleCompare,
        clearCompare,
        selectedProduct,
        setSelectedProduct,
        searchQuery,
        setSearchQuery,
        showLogin,
        setShowLogin,
        user,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
