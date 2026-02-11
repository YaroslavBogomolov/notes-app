const { validateString, isValidId } = require('../src/server');

describe('Utility functions', () => {
  describe('validateString', () => {
    test('returns true for non-empty string', () => {
      expect(validateString('Hello')).toBe(true);
    });
    test('returns false for whitespace only', () => {
      expect(validateString('   ')).toBe(false);
    });
    test('returns false for empty string', () => {
      expect(validateString('')).toBe(false);
    });
    test('returns false for null', () => {
      expect(validateString(null)).toBe(false);
    });
    test('returns false for undefined', () => {
      expect(validateString(undefined)).toBe(false);
    });
    test('returns false for number', () => {
      expect(validateString(123)).toBe(false);
    });
    test('returns false for boolean', () => {
      expect(validateString(true)).toBe(false);
    });
    test('returns false for object', () => {
      expect(validateString({})).toBe(false);
    });
  });

  describe('isValidId', () => {
    test('returns true for positive integer string', () => {
      expect(isValidId('1')).toBe(true);
    });
    test('returns false for zero', () => {
      expect(isValidId('0')).toBe(false);
    });
    test('returns false for negative number', () => {
      expect(isValidId('-5')).toBe(false);
    });
    test('returns false for non-numeric string', () => {
      expect(isValidId('abc')).toBe(false);
    });
    test('returns false for null', () => {
      expect(isValidId(null)).toBe(false);
    });
    test('returns false for undefined', () => {
      expect(isValidId(undefined)).toBe(false);
    });
    test('returns false for empty string', () => {
      expect(isValidId('')).toBe(false);
    });
    test('returns false for decimal string', () => {
      expect(isValidId('1.5')).toBe(false);
    });
    test('returns false for string with leading zeros', () => {
      expect(isValidId('01')).toBe(false);
    });
  });
});