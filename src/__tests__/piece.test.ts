import { flip, getChangeablePiece } from '../piece';

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
describe('getChangeablePiece', () => {
  test('success', () => {
    const changeablePiece = getChangeablePiece('p');
    expect(changeablePiece).toStrictEqual(['p', 'P', '+p', '+P']);
  });
  test('only one result when argument is Gold', () => {
    const changeablePiece = getChangeablePiece('k');
    expect(changeablePiece).toStrictEqual(['k', 'K']);
  });
  test('argument is upperCase', () => {
    const changeablePiece = getChangeablePiece('P');
    expect(changeablePiece).toStrictEqual(['p', 'P', '+p', '+P']);
  });
  test('argument is promoted piece', () => {
    const changeablePiece = getChangeablePiece('+P');
    expect(changeablePiece).toStrictEqual(['p', 'P', '+p', '+P']);
  });
});
