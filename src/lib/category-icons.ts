import { Shirt, Flower2, Footprints, Gem, Percent, Sparkles, Tag, type LucideIcon } from 'lucide-react'

/**
 * Category icons are chosen from a curated Lucide set keyed by slug, rather
 * than stored as free-text emoji — keeps the visual language consistent and
 * lets new admin-created categories fall back to a sensible default.
 */
export const categoryIcons: Record<string, LucideIcon> = {
  masculino: Shirt,
  feminino: Flower2,
  calcados: Footprints,
  acessorios: Gem,
  promocoes: Percent,
  novidades: Sparkles,
}

export function getCategoryIcon(slug: string): LucideIcon {
  return categoryIcons[slug] ?? Tag
}
