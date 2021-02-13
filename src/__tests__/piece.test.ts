import { turnOver, getChangeablePiece } from '../piece';

describe('turnOver', () => {
  test('success', () => {
    const porn = turnOver('p');
    expect(porn).toBe('P');
  });
  test('reverse', () => {
    const porn = turnOver('P');
    expect(porn).toBe('p');
  });
  test('promoted piece', () => {
    const porn = turnOver('+P');
    expect(porn).toBe('+p');
  });
});
describe('getChangeablePiece', () => {
  test('success', () => {
    const changeablePiece = getChangeablePiece('p');
    expect(changeablePiece).toStrictEqual(['P', '+P', 'p', '+p']);
  });
  test('only one result when argument is Gold', () => {
    const changeablePiece = getChangeablePiece('k');
    expect(changeablePiece).toStrictEqual(['k', 'K']);
  });
  test('argument is upperCase', () => {
    const changeablePiece = getChangeablePiece('P');
    expect(changeablePiece).toStrictEqual(['P', '+P', 'p', '+p']);
  });
  test('argument is promoted piece', () => {
    const changeablePiece = getChangeablePiece('+P');
    expect(changeablePiece).toStrictEqual(['P', '+P', 'p', '+p']);
  });
});
