"use client"

import React from "react"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import Header from "./Header"
import Footer from "./Footer"
import { useApp } from "../AppContext"

const LoginDialog = dynamic(() => import("../dialogs/LoginDialog"), {
  ssr: false,
})

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { showLogin } = useApp()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {children}
        {showLogin && <LoginDialog />}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 relative">
        {children}
      </main>

      <Footer />

      {showLogin && <LoginDialog />}
    </div>
  )
}
