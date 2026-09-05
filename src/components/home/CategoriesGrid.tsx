import React from "react"
import Link from "next/link"
import { 
  Palette,
  Frame,
  Gem,
  Gift,
  Sparkles,
  Layers
} from "lucide-react"

const CATEGORIES = [
  {
    name: "تابلو نقاشی",
    filter: "تابلو نقاشی",
    icon: Palette,
  },
  {
    name: "هنر دیواری",
    filter: "هنر دیواری",
    icon: Layers,
  },
  {
    name: "مجسمه و دکوری",
    filter: "مجسمه و دکوری",
    icon: Gem,
  },
  {
    name: "قاب و فریم",
    filter: "قاب و فریم",
    icon: Frame,
  },
  {
    name: "هنر مدرن",
    filter: "هنر مدرن",
    icon: Sparkles,
  },
  {
    name: "هدایای هنری",
    filter: "هدایای هنری",
    icon: Gift,
  },
] as const

export default function CategoriesGrid() {
  return (
    <section className="w-full mt-12 md:mt-16">
      <div className="flex flex-col gap-1 mb-8 text-center sm:text-start">
        <h2 className="text-xl md:text-2xl font-black text-heading">دسته‌بندی آثار هنری</h2>
        <div className="h-1 w-12 bg-primary rounded-full mx-auto sm:mx-0" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {CATEGORIES.map((cat, idx) => {
          const IconComponent = cat.icon
          return (
            <Link
              key={idx}
              href={`/products?category=${encodeURIComponent(cat.filter)}`}
              className="flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer border border-border hover:border-primary shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group bg-card"
            >
              <div className="p-4 rounded-xl mb-3 transition-transform duration-300 group-hover:scale-110 bg-secondary text-primary shadow-sm">
                <IconComponent className="size-6" />
              </div>
              <span className="text-xs font-extrabold text-foreground text-center line-clamp-1 group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
