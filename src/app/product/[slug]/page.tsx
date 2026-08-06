"use client"

import React, { useEffect } from "react"
import { useParams } from "next/navigation"
import ProductDetailsView from "@/components/views/ProductDetailsView"
import { useApp } from "@/components/AppContext"
import { useProduct } from "@/hooks/useProducts"

export default function ProductPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug || ""
  const { setSelectedProduct } = useApp()
  const { data: product, isLoading } = useProduct(slug)

  useEffect(() => {
    if (product) {
      setSelectedProduct(product)
    }
  }, [product, setSelectedProduct])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="size-10 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-xs text-muted-foreground font-semibold">در حال دریافت اطلاعات محصول از سرور...</p>
      </div>
    )
  }

  return <ProductDetailsView />
}
