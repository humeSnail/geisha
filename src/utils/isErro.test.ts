import { isError } from './isError';

describe('isError', () => {
  test('是error的情况', () => {
    expect(isError(new Error('a error'))).toBe(true);
    expect(isError(new TypeError('a error'))).toBe(true);
  });

  test('不是error的情况', () => {
    expect(isError(1)).toBe(false);
    expect(isError('a')).toBe(false);
    expect(isError(true)).toBe(false);
    expect(isError([])).toBe(false);
    expect(isError({})).toBe(false);
  });
});
