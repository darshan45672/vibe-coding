import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn function', () => {
    test('merges classes correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    test('handles undefined values', () => {
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2')
    })

    test('handles null values', () => {
      expect(cn('class1', null, 'class2')).toBe('class1 class2')
    })

    test('handles empty strings', () => {
      expect(cn('class1', '', 'class2')).toBe('class1 class2')
    })

    test('handles conditional classes', () => {
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3')
      expect(cn('class1', true && 'class2', 'class3')).toBe('class1 class2 class3')
    })

    test('handles no arguments', () => {
      expect(cn()).toBe('')
    })

    test('handles single class', () => {
      expect(cn('single-class')).toBe('single-class')
    })
  })
})
