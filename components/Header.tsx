"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Space_Grotesk } from "next/font/google"

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
})

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/set-look", label: "Set Search" },
  { href: "/set-rank", label: "Top Sets" },
  { href: "/about", label: "About + FAQ" },
  { href: "/contact", label: "Contact" },
]

interface HeaderProps {
  hideCta?: boolean
}

export default function Header({ hideCta = false }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false)
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <header className="mb-12 md:mb-16 flex items-center justify-between relative">
      {/* Logo */}
      <Link
        href="/"
        className={`${headingFont.className} text-2xl font-bold tracking-tight`}
      >
        BrckTrckr
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden gap-7 text-sm font-medium text-neutral-600 dark:text-neutral-400 md:flex">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href
                ? "font-bold text-neutral-900 dark:text-white transition-colors hover:text-neutral-900 dark:hover:text-white"
                : "transition-colors hover:text-neutral-900 dark:hover:text-white"
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right side: CTA button (desktop) + Mobile menu button */}
      <div className="flex items-center gap-3">
        {!hideCta && (
          <Link
            href="/set-look"
            className="hidden sm:inline-block rounded-xl bg-black dark:bg-white dark:text-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
          >
            SEARCH SETS
          </Link>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-[rgb(251,249,247)] dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-gray-700">
            <span className={`${headingFont.className} text-xl font-bold`}>
              Menu
            </span>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-neutral-100 dark:bg-gray-800 text-neutral-900 dark:text-white"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-gray-800 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-neutral-200 dark:border-gray-700">
            <Link
              href="/set-look"
              onClick={closeMobileMenu}
              className="block w-full text-center rounded-xl bg-black dark:bg-white dark:text-black px-4 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
            >
              SEARCH SETS
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
