import { describe, expect, it } from 'vitest'
import { buildTaskLists, toChecklistText, weekStart } from './googleTasks'
import { dayEntries, generatePlan } from './planner'
import { buildShoppingList } from './shopping'
import { defaultState } from './store'

describe('Google Tasks export', () => {
  const s = defaultState()
  s.plan = generatePlan(s, 5)
  const wed = new Date(2026, 9, 14) // Wednesday 14 Oct 2026

  it('maps the plan onto the current Mon–Sun week', () => {
    expect(weekStart(wed).toDateString()).toBe(new Date(2026, 9, 12).toDateString())
  })

  it('creates one task per meal, due on its day, with ingredients', () => {
    const [meals] = buildTaskLists(s, { meals: true, shopping: false, prep: false }, wed)
    const entries = s.plan.reduce((n, d) => n + dayEntries(d).length, 0)
    expect(meals.tasks).toHaveLength(entries)
    expect(meals.tasks[0].due).toBe('2026-10-12')
    expect(meals.tasks[meals.tasks.length - 1].due).toBe('2026-10-18')
    expect(meals.tasks[0].title).toMatch(/^Mon \d{1,2}:\d{2} (am|pm) · Breakfast: /)
    expect(meals.tasks[0].notes).toMatch(/kcal/)
    expect(meals.tasks[0].notes).toMatch(/• .+: \d+ g/)
  })

  it('lists every grocery item plus a total, and prep tasks', () => {
    const lists = buildTaskLists(s, { meals: false, shopping: true, prep: true }, wed)
    const shop = lists.find((l) => l.title.startsWith('Groceries'))!
    expect(shop.tasks).toHaveLength(buildShoppingList(s).items.length + 1)
    const prep = lists.find((l) => l.title.startsWith('Prep'))
    // The Sunday before (Oct 11) has passed relative to Wednesday, so prep is due today.
    if (prep) expect(prep.tasks[0].due).toBe('2026-10-14')
    expect(toChecklistText(lists)).toMatch(/- \[ \] /)
  })
})
