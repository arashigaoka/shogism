import { initializeBoard, flip, toPrettierString, selectPiece } from '../index';

describe('flip', () => {
  test('flip', () => {
    const flippedPorn = flip('p');
    expect(flippedPorn).toBe('P');
  });
});
describe('board', () => {
  test('initialize board', () => {
    const sfenInput =
      'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';
    const board = initializeBoard(sfenInput);
    expect(board.length).toBe(81);
    const prettierString = `lnsgkgsnl
.r.....b.
ppppppppp
.........
.........
.........
PPPPPPPPP
.B.....R.
LNSGKGSNL
`;
    expect(toPrettierString(board)).toBe(prettierString);
  });
  test('select piece', () => {
    const sfenInput =
      'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';
    const board = initializeBoard(sfenInput);
    expect(selectPiece(board, 0)).toBe('l');
    expect(selectPiece(board, 80)).toBe('L');
    expect(selectPiece(board, { x: 9, y: 1 })).toBe('l');
    expect(selectPiece(board, { x: 7, y: 7 })).toBe('P');
    expect(selectPiece(board, { x: 9, y: 8 })).toBe('');
    function selectPieceWithInvalidNum() {
      selectPiece(board, 81);
    }
    expect(selectPieceWithInvalidNum).toThrowError(
      'selected Position is out of bounds',
    );
    function selectPieceWithInvalidPoint() {
      selectPiece(board, { x: 0, y: 2 });
    }
    expect(selectPieceWithInvalidPoint).toThrowError(
      'selected Position is out of bounds',
    );
  });
});
