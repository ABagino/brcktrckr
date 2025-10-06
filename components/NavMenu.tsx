"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react" // hamburger icon

export default function NavMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
          <Link
            href="/"
            className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setOpen(false)}
          >
            Home Page
          </Link>
          <Link
            href="/setlook"
            className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setOpen(false)}
          >
            Set Lookup Page
          </Link>
          <Link
            href="/contact"
            className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setOpen(false)}
          >
            Contact Page
          </Link>
        </div>
      )}
    </div>
  )
}
