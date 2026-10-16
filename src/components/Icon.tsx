import {
  Activity, ArrowLeftRight, Bean, Bone, Brain, CalendarDays, Check, ChefHat, ChevronDown, ChevronRight, CloudSun,
  Droplet, Dumbbell, Flame, Flower2, GlassWater, Heart, HeartPulse, Info, Lightbulb, Lock, LockOpen, Microscope, Moon,
  Pill, Puzzle, RefreshCw, ShieldCheck, ShoppingCart, Sparkles, Sprout, Star, Stethoscope, Syringe, Tag, Target,
  UtensilsCrossed, Waves, X, Zap, type LucideIcon,
} from 'lucide-react'

const ICONS = {
  activity: Activity, swap: ArrowLeftRight, bean: Bean, bone: Bone, brain: Brain, calendar: CalendarDays, check: Check,
  chef: ChefHat, chevronDown: ChevronDown, chevronRight: ChevronRight, cloudSun: CloudSun, droplet: Droplet,
  dumbbell: Dumbbell, flame: Flame, flower: Flower2, water: GlassWater, heart: Heart, heartPulse: HeartPulse, info: Info,
  lightbulb: Lightbulb, lock: Lock, unlock: LockOpen, microscope: Microscope, moon: Moon, pill: Pill, puzzle: Puzzle,
  refresh: RefreshCw, shield: ShieldCheck, cart: ShoppingCart, sparkles: Sparkles, sprout: Sprout, star: Star,
  stethoscope: Stethoscope, syringe: Syringe, tag: Tag, target: Target, meal: UtensilsCrossed, waves: Waves, x: X, zap: Zap,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof ICONS

/** A line icon from the app's single icon set. Decorative unless a label is given. */
export function Icon({ name, size = 18, label, className }: { name: IconName; size?: number; label?: string; className?: string }) {
  const C = ICONS[name]
  return <C size={size} strokeWidth={1.9} className={`icon-svg ${className ?? ''}`} aria-hidden={label ? undefined : true} aria-label={label} role={label ? 'img' : undefined} />
}
