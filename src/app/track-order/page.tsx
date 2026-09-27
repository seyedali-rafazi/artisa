"use client"

import React, { Suspense } from "react"
import TrackOrderView from "@/components/views/TrackOrderView"
import { Loader2 } from "lucide-react"

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <TrackOrderView />
    </Suspense>
  )
}

