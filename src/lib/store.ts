import { useCallback, useEffect, useState } from 'react'
import type { AppState } from '../types'
import { parseUntrusted, sanitizeBackup, withoutSecrets } from './backup'
import { emptyPlan } from './plan-utils'
import { syncProducts } from './products'

const KEY = 'food-planner:v1'

export function defaultState(): AppState {
  return {
    profile: {
      name: '',
      sex: 'male',
      age: 30,
      weightLb: 170,
      heightIn: 69,
      activity: 'light',
      goal: 'maintain',
      adhd: true, // legacy flag; the conditions list is the source of truth
      stimulantMeds: false,
      state: '',
      zip: '',
      weeklyBudget: 75,
      maxMealMin: 25,
      snacksPerDay: 2,
      wakeTime: '07:00',
      bedTime: '23:00',
      workoutTime: '',
      caffeine: true,
      hotClimate: false,
      excluded: [],
      conditions: ['adhd'],
      diets: [],
      menopauseStage: 'meno',
      maoi: false,
      toleratedTriggers: [],
      optInTriggers: [],
      meds: { bloodThinner: false, ssri: false, thyroid: false, diabetesMeds: false, bpMeds: false, grapefruitMeds: false, pregnant: false },
      strengthTraining: false,
    },
    equipment: ['stove', 'skillet', 'pot', 'oven', 'sheetpan', 'microwave'],
    pantry: [],
    products: [],
    stores: [],
    priceOverrides: {},
    preferredStore: null,
    plan: emptyPlan(),
    checked: {},
    googleClientId: '',
    setupDone: false,
    disclaimerAccepted: false,
    termsAccepted: '',
    sleepLog: [],
    exportTarget: 'google',
    onyx: { url: 'http://127.0.0.1:4747', token: '' },
    fitness: { enabled: false, goal: 'hypertrophy', days: 3, sessionMin: 60, experience: 'new', access: 'gym', priorities: [], feedMealPlan: true },
    bodyLog: [],
    liftLog: [],
  }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    const base = defaultState()
    const profile = { ...base.profile, ...parsed.profile, meds: { ...base.profile.meds, ...parsed.profile?.meds } }
    // Saves from before health conditions existed: carry the old ADHD switch over.
    if (!parsed.profile?.conditions) profile.conditions = parsed.profile?.adhd === false ? [] : ['adhd']
    const state = { ...base, ...parsed, profile }
    syncProducts(state.products)
    return state
  } catch {
    return defaultState()
  }
}

export type Update = (fn: (s: AppState) => AppState) => void

export function useAppState(): [AppState, Update] {
  const [state, setState] = useState<AppState>(load)
  // Scanned products live in the shared food tables; bring them up to date before anything renders.
  syncProducts(state.products)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // Storage full or blocked: the app keeps working for this session.
    }
  }, [state])
  const update = useCallback<Update>((fn) => setState((s) => fn(s)), [])
  return [state, update]
}

/** A backup file's text. Tokens are left out (the AI key is never in the state at all). */
export function exportState(state: AppState): string {
  return JSON.stringify(withoutSecrets(state), null, 2)
}

/**
 * Read a backup file. Every field is checked and anything unexpected is dropped (see lib/backup).
 * `device` is this device's current state: its tokens and Terms agreement are kept.
 */
export function importState(json: string, device?: AppState): AppState {
  let parsed: unknown
  try {
    parsed = parseUntrusted(json)
  } catch (e) {
    throw e instanceof SyntaxError ? new Error('That file is not a Health Tracker backup.') : e
  }
  const state = sanitizeBackup(parsed, defaultState(), device)
  syncProducts(state.products)
  return state
}
