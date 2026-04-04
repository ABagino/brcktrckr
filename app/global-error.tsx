"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f3f4f6",
          color: "#111827",
          padding: "24px",
          fontFamily: "system-ui, sans-serif"
        }}>
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>💥</div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "12px" }}>
              Critical Error
            </h1>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              Something went seriously wrong. We&apos;re working on fixing it.
            </p>
            {error.digest && (
              <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "16px" }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                padding: "12px 24px",
                borderRadius: "6px",
                backgroundColor: "rgb(242,142,46)",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "16px"
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
