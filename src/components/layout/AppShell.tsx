"use client"

import React, { Suspense } from "react"
import Header from "./Header"
import Footer from "./Footer"
import LoginDialog from "../dialogs/LoginDialog"

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Suspense fallback={<div className="h-16 md:h-[8.25rem] border-b border-border bg-background/80" />}>
        <Header />
      </Suspense>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 relative">
        {children}
      </main>

      <Footer />

      <LoginDialog />
    </div>
  )
}
