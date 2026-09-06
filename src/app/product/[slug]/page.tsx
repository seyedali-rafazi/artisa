import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailsView from "@/components/views/ProductDetailsView";
import { Product } from "@/components/AppContext";
import {
  getSiteUrl,
  generateProductSchema,
  generateBreadcrumbSchema,
  getAbsoluteImageUrl,
} from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(id: string): Promise<Product | null> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://artisa-backend.vercel.app";
  try {
    const res = await fetch(`${backendUrl}/api/v1/products/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    const product = json?.data || json;
    return product && product.id ? (product as Product) : null;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "محصول یافت نشد | آرتیسا",
      description: "متاسفانه محصول مورد نظر یافت نشد یا از فروشگاه حذف شده است.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/product/${product.id}`;
  const title = `${product.name} | خرید و قیمت تابلو نقاشی`;
  const cleanDescription =
    product.description?.replace(/<[^>]+>/g, " ").trim().slice(0, 160) ||
    `خرید آنلاین ${product.name} در دسته‌بندی ${product.category} با قیمت ${product.price.toLocaleString("fa-IR")} تومان از گالری تخصصی آرتیسا با ضمانت اصالت فیزیکی و ارسال به سراسر کشور.`;

  const primaryImage = getAbsoluteImageUrl(product.image);

  return {
    title,
    description: cleanDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} | گالری آنلاین آرتیسا`,
      description: cleanDescription,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: primaryImage,
          width: 1000,
          height: 1000,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | گالری آرتیسا`,
      description: cleanDescription,
      images: [primaryImage],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const productSchema = generateProductSchema(product);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "خانه", url: "/" },
    {
      name: product.category,
      url: `/products?category=${encodeURIComponent(product.category)}`,
    },
    { name: product.name, url: `/product/${product.id}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailsView product={product} />
    </>
  );
}
