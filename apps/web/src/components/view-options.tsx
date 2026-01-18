"use client"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, ExternalLink } from "lucide-react"

interface ViewOptionsProps {
  markdownUrl: string
  githubUrl?: string
}

const AI_SERVICES = [
  { name: "ChatGPT", icon: "🤖", urlPrefix: "https://chatgpt.com/?q=Read%20" },
  { name: "Claude", icon: "A\\", urlPrefix: "https://claude.ai/new?q=Read%20" },
  { name: "T3 Chat", icon: "💬", urlPrefix: "https://t3.chat/?q=Read%20" },
]

export function ViewOptions({ markdownUrl, githubUrl }: ViewOptionsProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const fullUrl =
    typeof window !== "undefined"
      ? new URL(markdownUrl, window.location.origin).href
      : markdownUrl

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md bg-fd-primary text-fd-primary-foreground hover:opacity-90 transition-opacity"
      >
        Open
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-fd-border bg-fd-popover shadow-lg z-50">
          <div className="py-1">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-fd-accent transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Open in GitHub
                <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
              </a>
            )}
            {AI_SERVICES.map((service) => (
              <a
                key={service.name}
                href={`${service.urlPrefix}${encodeURIComponent(fullUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-fd-accent transition-colors"
              >
                <span className="w-4 text-center">{service.icon}</span>
                Open in {service.name}
                <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
