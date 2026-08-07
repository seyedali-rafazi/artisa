'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

export function getFullImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return '/placeholder.png';
  }
  const cleanUrl = url.trim();

  // If already absolute HTTP/HTTPS or data URI
  if (
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://') ||
    cleanUrl.startsWith('data:')
  ) {
    return cleanUrl;
  }

  // Relative backend upload path (e.g. "/uploads/xyz.png")
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  return `${baseUrl}${path}`;
}

interface ProductImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
}

export default function ProductImage({
  src,
  fallbackSrc = '/placeholder.png',
  alt,
  className,
  ...props
}: ProductImageProps) {
  const initialUrl = getFullImageUrl(src);
  const [imgSrc, setImgSrc] = useState<string>(initialUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(getFullImageUrl(src));
    setHasError(false);
  }, [src]);

  return (
    <Image
      {...props}
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt || 'محصول آرتیسا'}
      className={className}
      unoptimized
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
