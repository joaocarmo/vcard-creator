import { afterEach, beforeEach, vi } from 'vitest'
import VCard from '../lib/VCard'

/** The public add*() methods of VCard. */
export const addMethods = Object.getOwnPropertyNames(VCard.prototype).filter(
  (name) => name.startsWith('add'),
)

/** Fix the clock for each test of the calling suite, so REV is predictable. */
export function freezeTime(date = '2024-01-15T10:00:00Z'): void {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(date))
  })

  afterEach(() => {
    vi.useRealTimers()
  })
}
