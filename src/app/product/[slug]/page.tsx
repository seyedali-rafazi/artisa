"use client"

import React, { useEffect } from "react"
import { useParams } from "next/navigation"
import ProductDetailsView from "@/components/views/ProductDetailsView"
import { useApp } from "@/components/AppContext"
import { MOCK_PRODUCTS } from "@/data/products"

export default function ProductPage() {
  const params = useParams<{ slug: string }>()
  const { setSelectedProduct } = useApp()

  useEffect(() => {
    const product = MOCK_PRODUCTS.find((item) => item.id === params.slug)
    if (product) {
      setSelectedProduct(product)
    }
  }, [params.slug, setSelectedProduct])

  return <ProductDetailsView />
}
