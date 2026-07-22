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
  compareList: Product[]
  toggleCompare: (product: Product) => void
  clearCompare: () => void
  selectedProduct: Product | null
  setSelectedProduct: (product: Product | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  showLogin: boolean
  setShowLogin: (show: boolean) => void
  user: User | null
  setUser: (user: User | null) => void
  addresses: Address[]
  addAddress: (address: Omit<Address, "id">) => void
  updateAddress: (id: string, address: Omit<Address, "id">) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  orders: Order[]
  wishlist: Product[]
  toggleWishlist: (product: Product) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-10042",
    date: "۱۴۰۵/۰۳/۱۵",
    status: "delivered",
    totalPrice: 5050000,
    paymentStatus: "paid",
    items: [
      { id: "p1", name: "تابلو نقاشی رنگ‌روغن «افق طلایی»", price: 3200000, quantity: 1, image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=400&q=80" },
      { id: "p2", name: "تابلو آبرنگ «باغ در سپیده‌دم»", price: 1850000, quantity: 1, image: "https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=400&q=80" },
    ],
  },
  {
    id: "ORD-10038",
    date: "۱۴۰۵/۰۲/۲۸",
    status: "shipped",
    totalPrice: 680000,
    paymentStatus: "paid",
    items: [
      { id: "p3", name: "دیوارکوب ماکرامه گره‌دار بوهو", price: 680000, quantity: 1, image: "https://images.unsplash.com/photo-1611486212557-88be5ff6f941?auto=format&fit=crop&w=400&q=80" },
    ],
  },
  {
    id: "ORD-10029",
    date: "۱۴۰۵/۰۱/۱۰",
    status: "processing",
    totalPrice: 2750000,
    paymentStatus: "paid",
    items: [
      { id: "p4", name: "تابلو مینیاتور «شاهنامه»", price: 2750000, quantity: 1, image: "https://images.unsplash.com/photo-1580137189272-c9379f8864fd?auto=format&fit=crop&w=400&q=80" },
    ],
  },
]

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState<View>("home")
  const [cart, setCart] = useState<CartItem[]>([])
  const [compareList, setCompareList] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "addr-1",
      title: "خانه",
      fullName: "کاربر نمونه",
      phone: "09121234567",
      province: "تهران",
      city: "تهران",
      postalCode: "1234567890",
      addressLine: "خیابان ولیعصر، کوچه گلستان، پلاک ۱۲، واحد ۳",
      isDefault: true,
    },
  ])
  const [orders] = useState<Order[]>(MOCK_ORDERS)
  const [wishlist, setWishlist] = useState<Product[]>([])

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
        alert("You can compare up to 3 products only.")
        return prev
      }
      return [...prev, product]
    })
  }

  const clearCompare = () => setCompareList([])

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
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      if (exists) return prev.filter((p) => p.id !== product.id)
      return [...prev, product]
    })
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
        addresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        orders,
        wishlist,
        toggleWishlist,
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
