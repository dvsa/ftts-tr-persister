import { commas } from '../../../src/utils';

describe('string', () => {
  test('commas should return repeated commas', () => {
    expect(commas(0)).toBe('');
    expect(commas(1)).toBe(',');
    expect(commas(6)).toBe(',,,,,,');
  });
});
