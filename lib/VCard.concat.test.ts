import { vi } from 'vitest'
import VCard from './VCard'

describe('VCard.concat', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function createCard(givenName: string, familyName: string): VCard {
    return new VCard()
      .addName({ givenName, familyName })
      .addEmail({ address: `${givenName.toLowerCase()}@example.com` })
  }

  describe('static concat()', () => {
    it('should combine two cards into a multi-contact string', () => {
      const card1 = createCard('Alice', 'Smith')
      const card2 = createCard('Bob', 'Jones')

      const output = VCard.concat(card1, card2)

      const beginCount = (output.match(/BEGIN:VCARD/g) || []).length
      const endCount = (output.match(/END:VCARD/g) || []).length

      expect(beginCount).toBe(2)
      expect(endCount).toBe(2)
      expect(output).toContain('FN:Alice Smith')
      expect(output).toContain('FN:Bob Jones')
    })

    it('should combine three cards', () => {
      const card1 = createCard('Alice', 'Smith')
      const card2 = createCard('Bob', 'Jones')
      const card3 = createCard('Carol', 'Lee')

      const output = VCard.concat(card1, card2, card3)

      const beginCount = (output.match(/BEGIN:VCARD/g) || []).length
      expect(beginCount).toBe(3)
      expect(output).toContain('FN:Carol Lee')
    })

    it('should return the same as buildVCard() for a single card', () => {
      const card = createCard('Alice', 'Smith')

      expect(VCard.concat(card)).toBe(card.buildVCard())
    })

    it('should return empty string for no args', () => {
      expect(VCard.concat()).toBe('')
    })

    it('should keep each card properties within its own BEGIN/END block', () => {
      const card1 = createCard('Alice', 'Smith')
      const card2 = createCard('Bob', 'Jones')

      const output = VCard.concat(card1, card2)

      // Split into individual vCards
      const cards = output.split('END:VCARD\r\n').filter(Boolean)

      expect(cards[0]).toContain('FN:Alice Smith')
      expect(cards[0]).toContain('alice@example.com')
      expect(cards[0]).not.toContain('FN:Bob Jones')

      expect(cards[1]).toContain('FN:Bob Jones')
      expect(cards[1]).toContain('bob@example.com')
      expect(cards[1]).not.toContain('FN:Alice Smith')
    })
  })

  describe('instance concat()', () => {
    it('should produce the same result as static concat', () => {
      const card1 = createCard('Alice', 'Smith')
      const card2 = createCard('Bob', 'Jones')

      expect(card1.concat(card2)).toBe(VCard.concat(card1, card2))
    })

    it('should place this card first', () => {
      const card1 = createCard('Alice', 'Smith')
      const card2 = createCard('Bob', 'Jones')
      const card3 = createCard('Carol', 'Lee')

      const output = card1.concat(card2, card3)

      const firstFN = output.indexOf('FN:Alice Smith')
      const secondFN = output.indexOf('FN:Bob Jones')
      const thirdFN = output.indexOf('FN:Carol Lee')

      expect(firstFN).toBeLessThan(secondFN)
      expect(secondFN).toBeLessThan(thirdFN)
    })

    it('should return same as buildVCard() with no args', () => {
      const card = createCard('Alice', 'Smith')

      expect(card.concat()).toBe(card.buildVCard())
    })
  })
})
