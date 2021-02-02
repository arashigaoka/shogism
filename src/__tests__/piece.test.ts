import { flip } from '../piece';

describe('flip', () => {
  test('promote', () => {
    const flippedPorn = flip('p');
    expect(flippedPorn).toBe('P');
  });
  test('unpromote', () => {
    const flippedPorn = flip('P');
    expect(flippedPorn).toBe('p');
  });
});
