'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { axiosClient } from '@/lib/axios';
import { Upload, X, Star, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  featuredImage: string;
  galleryImages?: string[];
  onFeaturedChange: (url: string) => void;
  onGalleryChange?: (urls: string[]) => void;
}

export default function ImageUploader({
  featuredImage,
  galleryImages = [],
  onFeaturedChange,
  onGalleryChange,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMessage(null);
    const newGallery = [...galleryImages];
    let currentFeatured = featuredImage;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axiosClient.post('/api/v1/admin/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const rawUrl = response.data?.url || response.data?.data?.url;
        if (rawUrl) {
          const finalUrl = formatImageUrl(rawUrl);
          if (!currentFeatured) {
            currentFeatured = finalUrl;
            onFeaturedChange(finalUrl);
          } else {
            newGallery.push(finalUrl);
          }
        }
      } catch (err: any) {
        console.error('Failed to upload image:', err);
        setErrorMessage(err?.response?.data?.message || err?.message || 'خطا در آپلود تصویر');
      }
    }

    if (onGalleryChange) {
      onGalleryChange(newGallery);
    }
    setUploading(false);
  };

  const handleSetFeatured = (url: string) => {
    const oldFeatured = featuredImage;
    onFeaturedChange(url);

    if (onGalleryChange && oldFeatured && oldFeatured !== url) {
      const updatedGallery = galleryImages.filter((img) => img !== url);
      updatedGallery.push(oldFeatured);
      onGalleryChange(updatedGallery);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    if (!onGalleryChange) return;
    const updated = [...galleryImages];
    updated.splice(index, 1);
    onGalleryChange(updated);
  };

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      {errorMessage && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold">
          {errorMessage}
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border/80 hover:border-primary/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-muted/20 hover:bg-muted/40 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-primary font-bold text-xs">
            <Loader2 className="size-8 animate-spin" />
            <span>در حال آپلود تصاویر...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="size-6" />
            </div>
            <span className="text-xs font-extrabold text-foreground">
              تصاویر محصول را اینجا رها کنید یا برای انتخاب کلیک کنید
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold">
              فرمت‌های مجاز: JPG, PNG, WEBP (حداکثر ۵ مگابایت)
            </span>
          </div>
        )}
      </div>

      {/* Featured Image Preview */}
      {featuredImage && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
            <Star className="size-3.5 text-amber-500 fill-amber-500" />
            <span>تصویر اصلی (شاخص)</span>
          </span>
          <div className="relative size-32 rounded-2xl overflow-hidden border-2 border-primary shadow-lg shadow-primary/10 group">
            <Image src={featuredImage} alt="تصویر اصلی" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => onFeaturedChange('')}
              className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:bg-destructive transition-colors cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Gallery Images List */}
      {galleryImages.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
            <ImageIcon className="size-3.5 text-primary" />
            <span>گالری تصاویر ({galleryImages.length})</span>
          </span>
          <div className="flex flex-wrap gap-3">
            {galleryImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative size-24 rounded-2xl overflow-hidden border border-border bg-muted/20 group"
              >
                <Image src={imgUrl} alt={`گالری ${idx + 1}`} fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    title="انتخاب به عنوان تصویر اصلی"
                    onClick={() => handleSetFeatured(imgUrl)}
                    className="bg-primary text-primary-foreground p-1.5 rounded-xl hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star className="size-3.5 fill-white" />
                  </button>
                  <button
                    type="button"
                    title="حذف تصویر"
                    onClick={() => handleRemoveGalleryImage(idx)}
                    className="bg-destructive text-destructive-foreground p-1.5 rounded-xl hover:scale-110 transition-transform cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
