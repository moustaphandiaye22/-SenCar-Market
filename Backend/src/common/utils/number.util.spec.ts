import {
  toNullableNumber,
  toNullableString,
  toNumberOrZero,
} from './number.util';

describe('number.util', () => {
  it('converts supported values to numbers and falls back to zero', () => {
    expect(toNumberOrZero(12)).toBe(12);
    expect(toNumberOrZero('42.5')).toBe(42.5);
    expect(toNumberOrZero(null)).toBe(0);
    expect(toNumberOrZero(undefined)).toBe(0);
    expect(toNumberOrZero('not-a-number')).toBe(0);
  });

  it('converts nullable numeric values from several sources', () => {
    expect(toNullableNumber(null)).toBeNull();
    expect(toNullableNumber(undefined)).toBeNull();
    expect(toNullableNumber(19)).toBe(19);
    expect(toNullableNumber('19.5')).toBe(19.5);
    expect(toNullableNumber('bad')).toBeNull();
    expect(
      toNullableNumber({
        toNumber: () => 77,
      }),
    ).toBe(77);
  });

  it('converts values to nullable strings', () => {
    expect(toNullableString(null)).toBeNull();
    expect(toNullableString(undefined)).toBeNull();
    expect(toNullableString(123)).toBe('123');
    expect(toNullableString(false)).toBe('false');
  });
});
