"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { useUserProfile, useLogout } from "@/hooks/useAuth"
import { useFavorites, useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites"
import { refreshAccessToken } from "@/lib/api"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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
  gallery?: string[]
  images?: string[]
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
  role?: string;
}

type View = "home" | "product-details" | "cart" | "checkout" | "checkout-success" | "track-order" | "about-us" | "contact-us" | "blog" | "faq"

interface AppContextType {
  currentView: View
  setCurrentView: (view: View) => void
  isCartLoaded: boolean
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
  isAuthLoading: boolean
  logout: () => void
  addresses: Address[]
  addAddress: (address: Omit<Address, "id">) => void
  updateAddress: (id: string, address: Omit<Address, "id">) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  orders: Order[]
  wishlist: Product[]
  favoriteIds: string[]
  isFavorited: (productId: string) => boolean
  toggleWishlist: (product: Product) => void
  toggleFavorite: (product: Product) => void
  isFavoriteLoading: boolean
  showToast: (message: string, type?: "success" | "error" | "info") => void
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState<View>("home")
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartLoaded, setIsCartLoaded] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showLogin, setShowLogin] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])

  // Load Cart from LocalStorage on mount to prevent SSR hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("artisa_cart")
      if (saved) {
        setCart(JSON.parse(saved))
      }
    } catch {
      // ignore
    }
    setIsCartLoaded(true)
  }, [])

  const queryClient = useQueryClient()

  // Bootstrap Auth on initial page load: attempt silent refresh via HttpOnly cookie
  useEffect(() => {
    let isMounted = true
    refreshAccessToken()
      .then((token) => {
        if (isMounted && token) {
          queryClient.invalidateQueries({ queryKey: ["user-profile"] })
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsAuthLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [queryClient])

  // User Profile Query from TanStack Query
  const { data: userProfileData } = useUserProfile()
  const logoutMutation = useLogout()

  const user: User | null = useMemo(() => {
    if (!userProfileData) return null
    return {
      id: userProfileData.id,
      name: userProfileData.name,
      email: userProfileData.email,
      phone: userProfileData.phone,
      createdAt: userProfileData.createdAt,
      role: userProfileData.role,
    }
  }, [userProfileData])

  // Backend Favorites / Wishlist Sync
  const { data: backendFavoriteProducts = [] } = useFavorites()
  const { data: favoriteIds = [] } = useFavoriteIds()
  const toggleFavoriteMutation = useToggleFavorite()

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    if (type === "error") {
      toast.error(message)
    } else if (type === "info") {
      toast.info(message)
    } else {
      toast.success(message)
    }
  }, [])

  // Save Cart to LocalStorage (only after initial load has finished)
  useEffect(() => {
    if (isCartLoaded && typeof window !== "undefined") {
      localStorage.setItem("artisa_cart", JSON.stringify(cart))
    }
  }, [cart, isCartLoaded])

  const addToCart = useCallback((product: Product) => {
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
    showToast(`${product.name} به سبد خرید اضافه شد`, "success")
  }, [showToast])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }, [])

  const updateCartQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== productId))
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: qty } : item))
    )
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    if (typeof window !== "undefined") {
      localStorage.removeItem("artisa_cart")
    }
  }, [])

  const addAddress = useCallback((address: Omit<Address, "id">) => {
    const newAddr: Address = { ...address, id: `addr-${Date.now()}` }
    setAddresses((prev) => {
      if (address.isDefault) {
        return [...prev.map((a) => ({ ...a, isDefault: false })), newAddr]
      }
      return [...prev, newAddr]
    })
  }, [])

  const updateAddress = useCallback((id: string, address: Omit<Address, "id">) => {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === id) return { ...address, id }
        if (address.isDefault) return { ...a, isDefault: false }
        return a
      })
    )
  }, [])

  const deleteAddress = useCallback((id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const setDefaultAddress = useCallback((id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    )
  }, [])

  const isFavorited = useCallback((productId: string): boolean => {
    return Boolean(user && favoriteIds.includes(productId))
  }, [user, favoriteIds])

  const toggleFavorite = useCallback((product: Product) => {
    if (!user) {
      setShowLogin(true)
      showToast("برای افزودن به علاقه‌مندی‌ها ابتدا وارد حساب شوید", "info")
      return
    }

    const currentlyFavorited = Boolean(favoriteIds.includes(product.id))

    toggleFavoriteMutation.mutate(
      { product, isFavorited: currentlyFavorited },
      {
        onSuccess: () => {
          if (currentlyFavorited) {
            showToast("محصول از علاقه‌مندی‌ها حذف شد", "info")
          } else {
            showToast("محصول به علاقه‌مندی‌ها اضافه شد", "success")
          }
        },
        onError: () => {
          showToast("خطا در به روزرسانی علاقه‌مندی‌ها", "error")
        },
      }
    )
  }, [user, favoriteIds, toggleFavoriteMutation, showToast])

  const logout = useCallback(() => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["favorites"] })
        queryClient.setQueryData(["favorites", "ids"], [])
        queryClient.setQueryData(["favorites", "list"], [])
      },
    })
  }, [logoutMutation, queryClient])

  const isFavoriteLoading = toggleFavoriteMutation.isPending

  const contextValue = useMemo<AppContextType>(
    () => ({
      currentView,
      setCurrentView,
      cart,
      isCartLoaded,
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
      isAuthLoading,
      logout,
      addresses,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      orders: [],
      wishlist: backendFavoriteProducts,
      favoriteIds,
      isFavorited,
      toggleWishlist: toggleFavorite,
      toggleFavorite,
      isFavoriteLoading,
      showToast,
    }),
    [
      currentView,
      cart,
      isCartLoaded,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      selectedProduct,
      searchQuery,
      showLogin,
      user,
      isAuthLoading,
      logout,
      addresses,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      backendFavoriteProducts,
      favoriteIds,
      isFavorited,
      toggleFavorite,
      isFavoriteLoading,
      showToast,
    ]
  )

  return (
    <AppContext.Provider value={contextValue}>
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
