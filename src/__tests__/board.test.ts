import {
  initSquare,
  toPrettierString,
  selectPiece,
  moveBoard,
  toSquareStr,
  initHands,
  initBoard,
} from '../index';
describe('squareList', () => {
  test('initialize squareList', () => {
    const sfenInput =
      'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';
    const squareList = initSquare(sfenInput);
    expect(squareList.length).toBe(81);
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
    expect(toPrettierString(squareList)).toBe(prettierString);
  });
  test('select piece', () => {
    const sfenInput =
      'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';
    const squareList = initSquare(sfenInput);
    expect(selectPiece(squareList, 0)).toBe('l');
    expect(selectPiece(squareList, 80)).toBe('L');
    expect(selectPiece(squareList, { x: 9, y: 1 })).toBe('l');
    expect(selectPiece(squareList, { x: 7, y: 7 })).toBe('P');
    expect(selectPiece(squareList, { x: 9, y: 8 })).toBe('');
    function selectPieceWithInvalidNum() {
      selectPiece(squareList, 81);
    }
    expect(selectPieceWithInvalidNum).toThrowError(
      'selected Position is out of bounds',
    );
    function selectPieceWithInvalidPoint() {
      selectPiece(squareList, { x: 0, y: 2 });
    }
    expect(selectPieceWithInvalidPoint).toThrowError(
      'selected Position is out of bounds',
    );
  });
});

describe('hands', () => {
  test('init hands properly', () => {
    const handsStr = 'KRB2G2S2N2L9Pkrb2g2s2n2l9p';
    const hands = initHands(handsStr);
    expect(hands['K']).toBe(1);
    expect(hands['p']).toBe(9);
  });
});

describe('init board', () => {
  test('init boards properly', () => {
    const board = initBoard();
    expect(board.hands['G']).toBe(0);
    expect(board.isSenteTurn).toBeTruthy();
    expect(board.squareList.length).toBe(81);
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
    expect(toPrettierString(board.squareList)).toBe(prettierString);
  });
});
describe('move board', () => {
  test('move board from square to square', () => {
    const squareStr =
      'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';
    const board = initBoard(squareStr);
    const move = '7g7f';
    const newBoard = moveBoard(board, move);
    const prettierString = `lnsgkgsnl
.r.....b.
ppppppppp
.........
.........
..P......
PP.PPPPPP
.B.....R.
LNSGKGSNL
`;
    expect(toPrettierString(newBoard.squareList)).toBe(prettierString);
    expect(newBoard.isSenteTurn).toBeFalsy();
    expect(toPrettierString(board.squareList)).not.toBe(prettierString);
  });
  test('move board and promote', () => {
    const squareStr =
      'lnsgkgsnl/1r5b1/pppppp1pp/6p2/9/2P6/PP1PPPPPP/1B5R1/LNSGKGSNL';
    const board = initBoard(squareStr, '', 'w');
    const move = '8h2b+';
    const newBoard = moveBoard(board, move);
    const prettierString = `lnsgkgsnl
.r.....+B.
pppppp.pp
......p..
.........
..P......
PP.PPPPPP
.......R.
LNSGKGSNL
`;
    expect(toPrettierString(newBoard.squareList)).toBe(prettierString);
    expect(newBoard.hands['B']).toBe(1);
    expect(newBoard.isSenteTurn).toBeFalsy();
  });
  test('drop piece to board', () => {
    const squareStr =
      'lnsgkg1nl/1r5s1/pppppp1pp/6p2/9/2P6/PP1PPPPPP/7R1/LNSGKGSNL';
    const board = initBoard(squareStr, 'Bb', 'w');
    const newBoard = moveBoard(board, 'B*4e');
    const prettierString = `lnsgkg.nl
.r.....s.
pppppp.pp
......p..
.....B...
..P......
PP.PPPPPP
.......R.
LNSGKGSNL
`;
    expect(toPrettierString(newBoard.squareList)).toBe(prettierString);
    expect(newBoard.hands['B']).toBe(0);
    expect(newBoard.hands['b']).toBe(1);
  });
  test('drop piece to board in gote turn', () => {
    const squareStr =
      'lnsgkg1nl/1r5s1/pppppp1pp/6p2/5B3/2P6/PP1PPPPPP/7R1/LNSGKGSNL';
    const board = initBoard(squareStr, 'b', 'b');
    const newBoard = moveBoard(board, 'B*6e');
    const prettierString = `lnsgkg.nl
.r.....s.
pppppp.pp
......p..
...b.B...
..P......
PP.PPPPPP
.......R.
LNSGKGSNL
`;
    expect(toPrettierString(newBoard.squareList)).toBe(prettierString);
    expect(newBoard.hands['b']).toBe(0);
  });
});

describe('toSquareStr', () => {
  test('toSquareStr', () => {
    const sfenInput =
      'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';
    const board = initSquare(sfenInput);
    expect(toSquareStr(board)).toBe(sfenInput);
  });
});
