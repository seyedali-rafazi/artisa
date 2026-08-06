"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useUserProfile, useLogout } from "@/hooks/useAuth"
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist"

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

export interface Address {
  id: string
  title: string
  fullName: string
  phone: string
  province: string
  city: string
  postalCode: string
  addressLine: string
  isDefault: boolean
}

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface Order {
  id: string
  date: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  totalPrice: number
  paymentStatus: "paid" | "unpaid" | "refunded"
  items: OrderItem[]
}

export interface User {
  id?: string
  name: string
  email: string
  phone?: string
  createdAt?: string
  role?: string
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
  selectedProduct: Product | null
  setSelectedProduct: (product: Product | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  showLogin: boolean
  setShowLogin: (show: boolean) => void
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  addresses: Address[]
  addAddress: (address: Omit<Address, "id">) => void
  updateAddress: (id: string, address: Omit<Address, "id">) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  orders: Order[]
  wishlist: Product[]
  toggleWishlist: (product: Product) => void
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState<View>("home")
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("artisa_cart")
        return saved ? JSON.parse(saved) : []
      } catch {
        return []
      }
    }
    return []
  })
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showLogin, setShowLogin] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])

  // User Profile Query from TanStack Query
  const { data: userProfileData } = useUserProfile()
  const logoutMutation = useLogout()

  const user: User | null = userProfileData
    ? {
        id: userProfileData.id,
        name: userProfileData.name,
        email: userProfileData.email,
        phone: userProfileData.phone,
        createdAt: userProfileData.createdAt,
        role: userProfileData.role,
      }
    : null

  // Backend Wishlist Sync
  const { data: backendWishlist } = useWishlist()
  const toggleWishlistMutation = useToggleWishlist()
  const [localWishlist, setLocalWishlist] = useState<Product[]>([])

  const wishlist = user ? backendWishlist || [] : localWishlist

  // Save Cart to LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("artisa_cart", JSON.stringify(cart))
    }
  }, [cart])

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
          nameEn: product.nameEn || product.name,
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

  const clearCart = () => {
    setCart([])
    if (typeof window !== "undefined") {
      localStorage.removeItem("artisa_cart")
    }
  }

  const addAddress = (address: Omit<Address, "id">) => {
    const newAddr: Address = { ...address, id: `addr-${Date.now()}` }
    setAddresses((prev) => {
      if (address.isDefault) {
        return [...prev.map((a) => ({ ...a, isDefault: false })), newAddr]
      }
      return [...prev, newAddr]
    })
  }

  const updateAddress = (id: string, address: Omit<Address, "id">) => {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === id) return { ...address, id }
        if (address.isDefault) return { ...a, isDefault: false }
        return a
      })
    )
  }

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    )
  }

  const toggleWishlist = (product: Product) => {
    if (user) {
      toggleWishlistMutation.mutate(product.id)
    } else {
      setLocalWishlist((prev) => {
        const exists = prev.find((p) => p.id === product.id)
        if (exists) return prev.filter((p) => p.id !== product.id)
        return [...prev, product]
      })
    }
  }

  const logout = () => {
    logoutMutation.mutate()
  }

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
        selectedProduct,
        setSelectedProduct,
        searchQuery,
        setSearchQuery,
        showLogin,
        setShowLogin,
        user,
        setUser: () => {},
        logout,
        addresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        orders: [],
        wishlist,
        toggleWishlist,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
