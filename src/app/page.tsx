"use client"

import React from "react"
import { useLanguage } from "@/components/LanguageContext"
import { useApp } from "@/components/AppContext"
import HeroSlider from "@/components/home/HeroSlider"
import CategoriesGrid from "@/components/home/CategoriesGrid"
import SpecialOffers from "@/components/home/SpecialOffers"
import BlogSection from "@/components/home/BlogSection"
import ProductBox from "@/components/home/ProductBox"
import { MOCK_PRODUCTS } from "@/data/products"
import { X, Search } from "lucide-react"

function MainAppContent() {
  const { searchQuery, setSearchQuery } = useApp()
  const { t } = useLanguage()

  // Filter products based on search or category filter
  const filteredProducts = MOCK_PRODUCTS.filter((prod) => {
    if (!searchQuery) return true
    
    // Category match
    if (searchQuery === prod.category) return true

    // Amazing offers quick tag match
    if (searchQuery === "special" && prod.isSpecial) return true

    // General text search
    const query = searchQuery.toLowerCase()
    return (
      prod.name.toLowerCase().includes(query) ||
      prod.description?.toLowerCase().includes(query) ||
      prod.category.toLowerCase().includes(query)
    )
  })

  const bestSellers = MOCK_PRODUCTS.filter((p) => p.isBestSeller)

  return (
    <div className="flex flex-col gap-12">
      {searchQuery ? (
        <div className="w-full">
          <div className="flex items-center justify-between gap-4 mb-8 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Search className="size-5 text-primary" />
              <h2 className="text-lg md:text-xl font-black">
                {`نتایج جستجو برای: «${searchQuery}»`}
              </h2>
              <span className="text-xs text-muted-foreground font-semibold">
                ({filteredProducts.length} کالا)
              </span>
            </div>
            <button 
              onClick={() => setSearchQuery("")}
              className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <span>پاک کردن فیلتر</span>
              <X className="size-4" />
            </button>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductBox key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-sm font-bold mb-4">
                کالایی با این مشخصات یافت نشد.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <HeroSlider />
          <CategoriesGrid />
          <SpecialOffers />
          
          <section className="w-full">
            <div className="flex flex-col gap-1 mb-8">
              <h2 className="text-xl md:text-2xl font-black text-foreground">{t("bestSellersTitle")}</h2>
              <p className="text-xs text-muted-foreground">{t("bestSellersSubtitle")}</p>
              <div className="h-1 w-12 bg-primary rounded-full mt-1" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductBox key={product.id} product={product} />
              ))}
            </div>
          </section>

          <BlogSection />
        </>
      )}
    </div>
  )
}

export default function RootPage() {
  return <MainAppContent />
}
