import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { RECIPE_BY_ID } from '../data/recipes'
import type { AppState } from '../types'
import { RecipeSheet } from './RecipeSheet'

type Open = (recipeId: string, portion?: number) => void

const ViewerContext = createContext<Open>(() => {})

/** Lets any screen open a recipe's details sheet. */
export function RecipeViewerProvider({ state, children }: { state: AppState; children: ReactNode }) {
  const [open, setOpen] = useState<{ id: string; portion: number } | null>(null)
  const show = useCallback<Open>((id, portion = 1) => setOpen({ id, portion }), [])
  const recipe = open ? RECIPE_BY_ID[open.id] : undefined
  return (
    <ViewerContext.Provider value={show}>
      {children}
      {recipe && open && <RecipeSheet recipe={recipe} portion={open.portion} state={state} onClose={() => setOpen(null)} />}
    </ViewerContext.Provider>
  )
}

/** A recipe name that opens its details (ingredients, steps, nutrition, sources) when tapped. */
export function RecipeLink({ id, portion = 1, children, className = '' }: { id: string; portion?: number; children?: ReactNode; className?: string }) {
  const show = useContext(ViewerContext)
  const recipe = RECIPE_BY_ID[id]
  if (!recipe) return <>{children}</>
  return (
    <button
      type="button"
      className={`recipe-link ${className}`}
      onClick={(e) => { e.stopPropagation(); show(id, portion) }}
      title="Show recipe details"
    >
      {children ?? recipe.name}
    </button>
  )
}
