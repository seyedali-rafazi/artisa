"use client"

import React, { Suspense } from "react"
import ProfileView from "@/components/views/ProfileView"

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm font-bold text-muted-foreground">در حال بارگذاری...</div>}>
      <ProfileView />
    </Suspense>
  )
}
