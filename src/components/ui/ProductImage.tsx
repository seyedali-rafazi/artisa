'use client';

import React, { useState } from 'react';
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

  // Absolute or relative image URL (Blob URL or legacy /uploads path)
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
  const [hasError, setHasError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setHasError(false);
  }

  const isDataUri = typeof src === 'string' && src.startsWith('data:');
  const defaultSizes = props.fill
    ? (props.sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px')
    : props.sizes;

  const resolvedUrl = hasError ? fallbackSrc : getFullImageUrl(src);

  return (
    <Image
      sizes={defaultSizes}
      quality={props.quality ?? 80}
      {...props}
      src={resolvedUrl}
      alt={alt || 'محصول آرتیسا'}
      className={className}
      unoptimized={props.unoptimized || isDataUri}
      onError={() => {
        if (!hasError) {
          setHasError(true);
        }
      }}
    />
  );
}
