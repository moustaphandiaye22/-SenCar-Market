import {
  addDays,
  addMinutes,
  calculateExpiration,
  endOfDay,
  isFuture,
  isPast,
  isWithinRange,
  startOfDay,
  startOfMonth,
  subDays,
} from './date.util';

describe('date.util', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adds and subtracts days without mutating the source date', () => {
    const source = new Date('2026-03-10T12:00:00.000Z');

    const plusThree = addDays(source, 3);
    const minusTwo = subDays(source, 2);

    expect(plusThree.toISOString()).toBe('2026-03-13T12:00:00.000Z');
    expect(minusTwo.toISOString()).toBe('2026-03-08T12:00:00.000Z');
    expect(source.toISOString()).toBe('2026-03-10T12:00:00.000Z');
  });

  it('adds minutes and calculates expiration dates', () => {
    const source = new Date('2026-03-10T12:00:00.000Z');

    expect(addMinutes(source, 45).toISOString()).toBe(
      '2026-03-10T12:45:00.000Z',
    );
    expect(calculateExpiration(source, 7).toISOString()).toBe(
      '2026-03-17T12:00:00.000Z',
    );
  });

  it('detects past and future dates against the current time', () => {
    jest.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-03-10T12:00:00.000Z').getTime(),
    );

    expect(isPast(new Date('2026-03-09T12:00:00.000Z'))).toBe(true);
    expect(isPast(new Date('2026-03-10T12:00:00.000Z'))).toBe(false);
    expect(isFuture(new Date('2026-03-11T12:00:00.000Z'))).toBe(true);
    expect(isFuture(new Date('2026-03-10T12:00:00.000Z'))).toBe(false);
  });

  it('checks whether a date is inside an inclusive range', () => {
    const start = new Date('2026-03-10T00:00:00.000Z');
    const end = new Date('2026-03-20T00:00:00.000Z');

    expect(isWithinRange(start, start, end)).toBe(true);
    expect(isWithinRange(end, start, end)).toBe(true);
    expect(
      isWithinRange(new Date('2026-03-15T00:00:00.000Z'), start, end),
    ).toBe(true);
    expect(
      isWithinRange(new Date('2026-03-21T00:00:00.000Z'), start, end),
    ).toBe(false);
  });

  it('builds start and end boundaries for a given day', () => {
    const source = new Date('2026-03-10T12:34:56.789Z');

    expect(startOfDay(source).toISOString()).toBe('2026-03-10T00:00:00.000Z');
    expect(endOfDay(source).toISOString()).toBe('2026-03-10T23:59:59.999Z');
  });

  it('returns the first day of the month', () => {
    expect(
      startOfMonth(new Date('2026-03-10T12:34:56.789Z')).toISOString(),
    ).toBe('2026-03-01T00:00:00.000Z');
  });
});
