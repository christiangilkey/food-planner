import {
  Activity, ArrowLeftRight, Bean, Bone, Brain, CalendarDays, Check, ChefHat, ChevronDown, ChevronRight, CloudSun,
  Droplet, Dumbbell, Flame, Flower2, GlassWater, Heart, HeartPulse, Info, Lightbulb, Lock, LockOpen, Microscope, Moon,
  Pill, Puzzle, RefreshCw, ShieldCheck, ShoppingCart, Sparkles, Sprout, Star, Stethoscope, Syringe, Tag, Target,
  UtensilsCrossed, Waves, X, Zap, Leaf, Salad, Fish, Vegan, BatteryLow, Sun, Download, Share, SquarePlus, Gauge, Scale,
  Beef, Egg, WheatOff, Footprints, Coffee, Bed, Smartphone, Sunrise, Thermometer, type LucideIcon,
} from 'lucide-react'
import { Camera, Pencil, ScanBarcode, Trash2, WandSparkles } from 'lucide-react'
import { ChevronLeft, CircleUserRound } from 'lucide-react'
import { Ban, HardDrive, Search } from 'lucide-react'

const ICONS = {
  activity: Activity, swap: ArrowLeftRight, bean: Bean, bone: Bone, brain: Brain, calendar: CalendarDays, check: Check,
  chef: ChefHat, chevronDown: ChevronDown, chevronRight: ChevronRight, cloudSun: CloudSun, droplet: Droplet,
  dumbbell: Dumbbell, flame: Flame, flower: Flower2, water: GlassWater, heart: Heart, heartPulse: HeartPulse, info: Info,
  lightbulb: Lightbulb, lock: Lock, unlock: LockOpen, microscope: Microscope, moon: Moon, pill: Pill, puzzle: Puzzle,
  refresh: RefreshCw, shield: ShieldCheck, cart: ShoppingCart, sparkles: Sparkles, sprout: Sprout, star: Star,
  stethoscope: Stethoscope, syringe: Syringe, tag: Tag, target: Target, meal: UtensilsCrossed, waves: Waves, x: X, zap: Zap,
  leaf: Leaf, salad: Salad, fish: Fish, vegan: Vegan, batteryLow: BatteryLow, sun: Sun, download: Download, share: Share,
  squarePlus: SquarePlus, gauge: Gauge, scale: Scale, beef: Beef, egg: Egg, wheatOff: WheatOff, footprints: Footprints,
  coffee: Coffee, bed: Bed, smartphone: Smartphone, sunrise: Sunrise, thermometer: Thermometer,
  // Pantry scanner and magic plan
  scan: ScanBarcode, camera: Camera, wand: WandSparkles, trash: Trash2, pencil: Pencil,
  // Navigation
  user: CircleUserRound, chevronLeft: ChevronLeft,
  // Profile
  ban: Ban, hardDrive: HardDrive, search: Search,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof ICONS

/** A line icon from the app's single icon set. Decorative unless a label is given. */
export function Icon({ name, size = 18, label, className }: { name: IconName; size?: number; label?: string; className?: string }) {
  const C = ICONS[name]
  return <C size={size} strokeWidth={1.9} className={`icon-svg ${className ?? ''}`} aria-hidden={label ? undefined : true} aria-label={label} role={label ? 'img' : undefined} />
}
