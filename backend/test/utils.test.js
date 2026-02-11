describe('Utility functions', () => {
  const validateString = (str) => str && typeof str === 'string' && str.trim().length > 0;
  const isValidId = (id) => id && !isNaN(parseInt(id)) && parseInt(id) > 0;

  test('validateString', () => {
    expect(validateString('Hello')).toBe(true);
    expect(validateString('   ')).toBe(false);
    expect(validateString('')).toBe(false);
    expect(validateString(null)).toBe(false);
    expect(validateString(123)).toBe(false);
  });

  test('isValidId', () => {
    expect(isValidId('1')).toBe(true);
    expect(isValidId('0')).toBe(false);
    expect(isValidId('-5')).toBe(false);
    expect(isValidId('abc')).toBe(false);
    expect(isValidId(null)).toBe(false);
  });
});