// Test the weight rounding logic
describe('Weight Rounding Logic', () => {
  it('should round weight increment to nearest 5', () => {
    // Test increment logic: Math.ceil(value / 5) * 5
    expect(Math.ceil(32.5 / 5) * 5).toBe(35);
    expect(Math.ceil(30 / 5) * 5).toBe(30);
    expect(Math.ceil(31 / 5) * 5).toBe(35);
    expect(Math.ceil(27.3 / 5) * 5).toBe(30);
    expect(Math.ceil(0 / 5) * 5).toBe(0);
  });

  it('should round weight decrement to nearest 5 (going down)', () => {
    // Test decrement logic: Math.floor(value / 5) * 5 (or subtract 5 if already rounded)
    const testDecrement = (value: number) => {
      const roundedDown = Math.floor(value / 5) * 5;
      return value === roundedDown ? roundedDown - 5 : roundedDown;
    };

    expect(testDecrement(32.5)).toBe(30); // 32.5 -> 30
    expect(testDecrement(30)).toBe(25); // 30 -> 25 (already rounded, so subtract 5)
    expect(testDecrement(27.3)).toBe(25); // 27.3 -> 25
    expect(testDecrement(35)).toBe(30); // 35 -> 30
    expect(testDecrement(5)).toBe(0); // 5 -> 0
  });
});
