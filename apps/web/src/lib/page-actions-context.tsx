import { createContext, useContext } from "react"

interface PageActionsContextValue {
  markdownUrl: string
  githubUrl: string
}

const PageActionsContext = createContext<PageActionsContextValue | null>(null)

export const PageActionsProvider = PageActionsContext.Provider

export function usePageActions() {
  const context = useContext(PageActionsContext)
  if (!context) {
    throw new Error("usePageActions must be used within PageActionsProvider")
  }
  return context
}
