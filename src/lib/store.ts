import { useCallback, useEffect, useState } from 'react'
import type { AppState } from '../types'
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
    sleepLog: [],
    exportTarget: 'google',
    onyx: { url: 'http://127.0.0.1:4747', token: '' },
    fitness: { enabled: false, goal: 'hypertrophy', days: 3, sessionMin: 60, experience: 'new', access: 'gym', priorities: [], feedMealPlan: true },
    bodyLog: [],
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

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

export function importState(json: string): AppState {
  const parsed = JSON.parse(json) as Partial<AppState>
  const base = defaultState()
  if (!parsed.profile || !Array.isArray(parsed.plan)) throw new Error('That file is not a Health Tracker backup.')
  const state = { ...base, ...parsed, profile: { ...base.profile, ...parsed.profile, meds: { ...base.profile.meds, ...parsed.profile.meds } } }
  syncProducts(state.products)
  return state
}
