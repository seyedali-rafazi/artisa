"use client"

import React from "react"
import Header from "./Header"
import Footer from "./Footer"
import LoginDialog from "../dialogs/LoginDialog"
import CompareBar from "../home/CompareBar"

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 relative">
        {children}
      </main>

      <Footer />

      <LoginDialog />
      <CompareBar />
    </div>
  )
}
